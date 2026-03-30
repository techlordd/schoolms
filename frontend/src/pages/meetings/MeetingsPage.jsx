// src/pages/meetings/MeetingsPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Briefcase, Users, FileText } from 'lucide-react';
import { staffMeetingsApi } from '../../api/endpoints';
import { PageSpinner, EmptyState, Modal, FormGroup, Badge } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import useAuthStore from '../../store/authStore';

export default function MeetingsPage() {
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [viewId, setViewId] = useState(null);
  const { register, handleSubmit, reset } = useForm();
  const canManage = ['admin', 'head_teacher'].includes(user?.role);

  const { data, isLoading } = useQuery({
    queryKey: ['staff-meetings'],
    queryFn: () => staffMeetingsApi.list({ limit: 20 }).then(r => r.data),
  });

  const { data: viewData } = useQuery({
    queryKey: ['staff-meeting', viewId],
    queryFn: () => staffMeetingsApi.get(viewId).then(r => r.data.data),
    enabled: !!viewId,
  });

  const createMut = useMutation({
    mutationFn: data => staffMeetingsApi.create(data),
    onSuccess: () => {
      toast.success('Meeting created');
      qc.invalidateQueries(['staff-meetings']);
      setCreateOpen(false);
      reset();
    },
    onError: () => toast.error('Failed to create meeting'),
  });

  const meetings = data?.data || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Meetings</h1>
          <p className="page-subtitle">{meetings.length} meeting records</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Log Meeting
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Meeting list */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">All Meetings</h3></div>
          {isLoading ? <PageSpinner /> : !meetings.length ? (
            <EmptyState icon="📋" title="No meetings logged" description="Log your first staff meeting record." />
          ) : (
            <div className="divide-y divide-gray-50">
              {meetings.map(m => (
                <div key={m.id}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${viewId === m.id ? 'bg-primary-50' : ''}`}
                  onClick={() => setViewId(m.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Briefcase size={16} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{m.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(new Date(m.date), 'MMM d, yyyy · h:mm a')}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Logged by {m.createdBy?.firstName} {m.createdBy?.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users size={11} />
                        <span>{m.attendeeIds?.length || 0} attended</span>
                      </div>
                      {m.minutes && (
                        <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                          <FileText size={11} />
                          <span>Minutes recorded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meeting detail */}
        <div className="card">
          {viewData ? (
            <>
              <div className="card-header">
                <h3 className="card-title">{viewData.title}</h3>
                <span className="text-xs text-gray-400">{format(new Date(viewData.date), 'MMM d, yyyy')}</span>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Agenda</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {viewData.agenda || 'No agenda recorded'}
                  </p>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Minutes / Decisions</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {viewData.minutes || 'No minutes recorded yet'}
                  </p>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Attendance</p>
                  <div className="flex gap-3">
                    <div className="bg-green-50 rounded-lg px-3 py-2 text-center">
                      <div className="text-lg font-bold text-green-700 font-mono">{viewData.attendeeIds?.length || 0}</div>
                      <div className="text-xs text-gray-500">Present</div>
                    </div>
                    <div className="bg-red-50 rounded-lg px-3 py-2 text-center">
                      <div className="text-lg font-bold text-red-700 font-mono">{viewData.absentIds?.length || 0}</div>
                      <div className="text-xs text-gray-500">Absent</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-sm text-gray-400">
              Select a meeting to view details
            </div>
          )}
        </div>
      </div>

      {/* Create meeting modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Log Staff Meeting"
        size="lg"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button className="btn btn-primary"
              onClick={handleSubmit(d => createMut.mutate(d))}
              disabled={createMut.isPending}>
              {createMut.isPending ? 'Saving...' : 'Save Meeting'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <FormGroup label="Meeting Title" required>
            <input className="input" {...register('title', { required: true })} placeholder="e.g. Term 2 Planning Meeting" />
          </FormGroup>
          <div className="grid grid-cols-2 gap-3">
            <FormGroup label="Date & Time" required>
              <input type="datetime-local" className="input" {...register('date', { required: true })} />
            </FormGroup>
          </div>
          <FormGroup label="Agenda">
            <textarea className="input min-h-24" {...register('agenda')}
              placeholder="1. Term planning&#10;2. Budget review&#10;3. Curriculum updates" />
          </FormGroup>
          <FormGroup label="Minutes / Decisions">
            <textarea className="input min-h-24" {...register('minutes')}
              placeholder="Record decisions made and action items..." />
          </FormGroup>
        </div>
      </Modal>
    </div>
  );
}
