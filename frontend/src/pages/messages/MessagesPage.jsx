// src/pages/messages/MessagesPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Plus } from 'lucide-react';
import { messagesApi } from '../../api/endpoints';
import { Avatar, PageSpinner, Modal, FormGroup } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import useAuthStore from '../../store/authStore';

export default function MessagesPage() {
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [reply, setReply] = useState('');
  const { register, handleSubmit, reset } = useForm();

  const { data: inbox, isLoading } = useQuery({ queryKey:['inbox'], queryFn: () => messagesApi.inbox({ limit:30 }).then(r=>r.data.data) });
  const { data: thread } = useQuery({ queryKey:['thread', selected], queryFn: () => messagesApi.thread(selected).then(r=>r.data.data), enabled:!!selected });

  const sendMut = useMutation({
    mutationFn: data => messagesApi.send(data),
    onSuccess: () => { toast.success('Message sent'); qc.invalidateQueries(['inbox']); setComposeOpen(false); reset(); },
    onError: () => toast.error('Failed to send message'),
  });
  const replyMut = useMutation({
    mutationFn: () => messagesApi.send({ receiverId: thread?.message?.senderId, body: reply, parentId: selected }),
    onSuccess: () => { setReply(''); qc.invalidateQueries(['thread', selected]); },
    onError: () => toast.error('Failed to send'),
  });

  const selectMessage = async (id) => {
    setSelected(id);
    await messagesApi.markRead(id).catch(() => {});
    qc.invalidateQueries(['inbox']);
  };

  const initials = name => name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || 'U';
  const COLORS = ['bg-primary-100 text-primary-700','bg-blue-100 text-blue-700','bg-amber-100 text-amber-700'];

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Messages</h1></div>
        <button className="btn btn-primary" onClick={() => setComposeOpen(true)}><Plus size={16} /> New Message</button>
      </div>

      <div className="card overflow-hidden" style={{ height: 560 }}>
        <div className="flex h-full">
          {/* Inbox list */}
          <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500">Inbox ({inbox?.filter(m=>!m.isRead).length || 0} unread)</p>
            </div>
            <div className="overflow-y-auto flex-1">
              {isLoading ? <PageSpinner /> : inbox?.map(msg => (
                <div key={msg.id} onClick={() => selectMessage(msg.id)}
                  className={`flex gap-3 p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selected===msg.id ? 'bg-primary-50' : ''} ${!msg.isRead ? 'bg-blue-50/50' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${COLORS[(msg.sender?.firstName?.charCodeAt(0)||0)%COLORS.length]}`}>
                    {initials(`${msg.sender?.firstName} ${msg.sender?.lastName}`)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={`text-xs ${!msg.isRead ? 'font-semibold text-gray-800' : 'font-medium text-gray-700'} truncate`}>{msg.sender?.firstName} {msg.sender?.lastName}</p>
                      <p className="text-xs text-gray-400 flex-shrink-0 ml-1">{format(new Date(msg.createdAt), 'HH:mm')}</p>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{msg.subject || msg.body}</p>
                  </div>
                </div>
              ))}
              {!inbox?.length && <div className="flex items-center justify-center h-32 text-xs text-gray-400">No messages</div>}
            </div>
          </div>

          {/* Thread view */}
          <div className="flex-1 flex flex-col">
            {selected && thread ? (
              <>
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                  <Avatar name={`${thread.message?.sender?.firstName} ${thread.message?.sender?.lastName}`} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{thread.message?.sender?.firstName} {thread.message?.sender?.lastName}</p>
                    <p className="text-xs text-gray-400 capitalize">{thread.message?.sender?.role?.replace('_',' ')}</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {[thread.message, ...(thread.replies||[])].map(msg => {
                    const mine = msg?.senderId === user?.sub;
                    return (
                      <div key={msg?.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs rounded-2xl px-4 py-3 text-sm ${mine ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                          <p>{msg?.body}</p>
                          <p className={`text-xs mt-1.5 ${mine ? 'text-white/50' : 'text-gray-400'}`}>{msg?.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : ''}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-4 border-t border-gray-100 flex gap-3">
                  <input className="input flex-1" placeholder="Type a reply..." value={reply} onChange={e => setReply(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && reply.trim() && replyMut.mutate()} />
                  <button className="btn btn-primary" onClick={() => reply.trim() && replyMut.mutate()} disabled={!reply.trim() || replyMut.isPending}>
                    <Send size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">Select a message to view</div>
            )}
          </div>
        </div>
      </div>

      <Modal open={composeOpen} onClose={() => setComposeOpen(false)} title="New Message"
        footer={<><button className="btn btn-ghost" onClick={() => setComposeOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit(d => sendMut.mutate(d))}>Send</button></>}>
        <div className="space-y-3">
          <FormGroup label="Recipient ID" required><input className="input" {...register('receiverId', { required:true })} placeholder="User ID" /></FormGroup>
          <FormGroup label="Subject"><input className="input" {...register('subject')} placeholder="Subject..." /></FormGroup>
          <FormGroup label="Message" required><textarea className="input min-h-24" {...register('body', { required:true })} placeholder="Type your message..." /></FormGroup>
        </div>
      </Modal>
    </div>
  );
}
