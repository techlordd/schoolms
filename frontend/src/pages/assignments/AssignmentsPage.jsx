// src/pages/assignments/AssignmentsPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { assignmentsApi, classesApi } from '../../api/endpoints';
import { PageSpinner, Badge, EmptyState, Modal, FormGroup } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import useAuthStore from '../../store/authStore';

export default function AssignmentsPage() {
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data: classes } = useQuery({ queryKey:['classes'], queryFn: () => classesApi.list().then(r=>r.data.data) });

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentsApi.list({ term:2, academicYear:'2024/2025' }).then(r => r.data.data),
  });

  const createMut = useMutation({
    mutationFn: data => assignmentsApi.create({ ...data, term:2, academicYear:'2024/2025' }),
    onSuccess: () => { toast.success('Assignment created'); qc.invalidateQueries(['assignments']); setCreateOpen(false); reset(); },
    onError: () => toast.error('Failed to create assignment'),
  });

  const deleteMut = useMutation({
    mutationFn: id => assignmentsApi.remove(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['assignments']); },
    onError: () => toast.error('Failed to delete'),
  });

  const canCreate = ['admin','teacher','class_teacher'].includes(user?.role);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Assignments</h1><p className="page-subtitle">{assignments?.length ?? 0} active assignments</p></div>
        {canCreate && <button className="btn btn-primary" onClick={() => setCreateOpen(true)}><Plus size={16} /> Create Assignment</button>}
      </div>

      <div className="card">
        {isLoading ? <PageSpinner /> : !assignments?.length ? (
          <EmptyState icon="📝" title="No assignments yet" description="Create your first assignment to get started." />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Title</th><th>Class</th><th>Subject</th><th>Due Date</th><th>Submissions</th><th>Type</th><th></th></tr></thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a.id}>
                    <td>
                      <p className="font-medium text-gray-800">{a.title}</p>
                      {a.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-48">{a.description}</p>}
                    </td>
                    <td><span className="badge badge-primary">{a.class?.name}</span></td>
                    <td className="text-gray-500">{a.subject?.name}</td>
                    <td className={`text-sm ${new Date(a.dueDate) < new Date() ? 'text-red-500' : 'text-gray-600'}`}>
                      {format(new Date(a.dueDate), 'MMM d, yyyy')}
                    </td>
                    <td className="font-mono text-sm text-gray-500">{a._count?.submissions ?? 0}</td>
                    <td><span className="badge badge-gray capitalize">{a.type}</span></td>
                    <td>
                      {canCreate && (
                        <button className="btn btn-ghost btn-sm text-red-500" onClick={() => deleteMut.mutate(a.id)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Assignment"
        footer={<><button className="btn btn-ghost" onClick={() => setCreateOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit(d => createMut.mutate(d))} disabled={createMut.isPending}>Create</button></>}>
        <div className="space-y-3">
          <FormGroup label="Title" required><input className="input" {...register('title', { required:true })} placeholder="e.g. Fractions Worksheet" /></FormGroup>
          <div className="grid grid-cols-2 gap-3">
            <FormGroup label="Class" required>
              <select className="select" {...register('classId', { required:true })}>
                <option value="">Select...</option>
                {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Type">
              <select className="select" {...register('type')}>
                <option value="homework">Homework</option>
                <option value="classwork">Classwork</option>
                <option value="project">Project</option>
                <option value="test">Test</option>
              </select>
            </FormGroup>
            <FormGroup label="Due Date" required><input type="datetime-local" className="input" {...register('dueDate', { required:true })} /></FormGroup>
            <FormGroup label="Max Score"><input type="number" className="input" {...register('maxScore')} defaultValue={100} /></FormGroup>
          </div>
          <FormGroup label="Description"><textarea className="input min-h-20" {...register('description')} placeholder="Instructions..." /></FormGroup>
        </div>
      </Modal>
    </div>
  );
}
