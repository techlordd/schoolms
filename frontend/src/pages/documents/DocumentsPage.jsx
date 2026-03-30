// src/pages/documents/DocumentsPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText, Download, Trash2 } from 'lucide-react';
import { documentsApi } from '../../api/endpoints';
import { PageSpinner, Badge, EmptyState, Modal, FormGroup } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CAT_COLORS = { academic:'badge-primary', admin:'badge-blue', medical:'badge-yellow', legal:'badge-red', financial:'badge-green', other:'badge-gray' };

export default function DocumentsPage() {
  const qc = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [category, setCategory] = useState('');
  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading } = useQuery({ queryKey:['documents', category], queryFn: () => documentsApi.list({ category, limit:30 }).then(r=>r.data) });
  const uploadMut = useMutation({
    mutationFn: data => documentsApi.upload(data),
    onSuccess: () => { toast.success('Document uploaded'); qc.invalidateQueries(['documents']); setUploadOpen(false); reset(); },
    onError: () => toast.error('Upload failed'),
  });
  const removeMut = useMutation({
    mutationFn: id => documentsApi.remove(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['documents']); },
  });

  const docs = data?.data || [];

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Documents</h1><p className="page-subtitle">{docs.length} documents</p></div>
        <button className="btn btn-primary" onClick={() => setUploadOpen(true)}><Plus size={16} /> Upload Document</button>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {['','academic','admin','medical','legal','financial','other'].map(c => (
          <button key={c||'all'} className={`btn btn-sm ${category===c ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCategory(c)}>
            {c ? c.charAt(0).toUpperCase()+c.slice(1) : 'All'}
          </button>
        ))}
      </div>

      <div className="card">
        {isLoading ? <PageSpinner /> : !docs.length ? (
          <EmptyState icon="📁" title="No documents found" description="Upload your first document to get started." />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Document</th><th>Category</th><th>Uploaded By</th><th>Date</th><th>Size</th><th></th></tr></thead>
              <tbody>
                {docs.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-gray-500" />
                        </div>
                        <p className="font-medium text-gray-800">{d.title}</p>
                      </div>
                    </td>
                    <td><span className={`badge ${CAT_COLORS[d.category] || 'badge-gray'}`}>{d.category}</span></td>
                    <td className="text-gray-500">{d.uploadedBy?.firstName} {d.uploadedBy?.lastName}</td>
                    <td className="text-gray-500">{format(new Date(d.createdAt), 'MMM d, yyyy')}</td>
                    <td className="text-gray-400 text-xs font-mono">{d.fileSize ? `${(Number(d.fileSize)/1024).toFixed(0)}KB` : '—'}</td>
                    <td>
                      <div className="flex gap-1">
                        <a href={d.fileUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><Download size={13} /></a>
                        <button className="btn btn-ghost btn-sm text-red-500" onClick={() => removeMut.mutate(d.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Document"
        footer={<><button className="btn btn-ghost" onClick={() => setUploadOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit(d => uploadMut.mutate(d))} disabled={uploadMut.isPending}>Upload</button></>}>
        <div className="space-y-3">
          <FormGroup label="Title" required><input className="input" {...register('title', { required:true })} /></FormGroup>
          <div className="grid grid-cols-2 gap-3">
            <FormGroup label="Category">
              <select className="select" {...register('category')}>
                <option value="academic">Academic</option><option value="admin">Admin</option><option value="medical">Medical</option><option value="legal">Legal</option><option value="financial">Financial</option><option value="other">Other</option>
              </select>
            </FormGroup>
            <FormGroup label="Related To">
              <select className="select" {...register('relatedType')}>
                <option value="">General</option><option value="student">Student</option><option value="staff">Staff</option><option value="school">School</option>
              </select>
            </FormGroup>
          </div>
          <FormGroup label="File URL" required><input className="input" {...register('fileUrl', { required:true })} placeholder="https://... (paste S3/CDN URL)" /></FormGroup>
          <p className="text-xs text-gray-400">In production, file upload will use multipart/form-data to S3.</p>
        </div>
      </Modal>
    </div>
  );
}
