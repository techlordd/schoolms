// src/pages/staff/StaffPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, UserCheck } from 'lucide-react';
import { staffApi } from '../../api/endpoints';
import { PageSpinner, Badge, Avatar, Modal, FormGroup } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function StaffPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data: staffData, isLoading } = useQuery({ queryKey:['staff'], queryFn: () => staffApi.list({ limit:50 }).then(r=>r.data) });

  const createMut = useMutation({
    mutationFn: data => staffApi.create(data),
    onSuccess: () => { toast.success('Staff member created'); qc.invalidateQueries(['staff']); setCreateOpen(false); reset(); },
    onError: e => toast.error(e.response?.data?.message || 'Failed to create staff'),
  });

  const staff = staffData?.data || [];

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Staff & Payroll</h1><p className="page-subtitle">{staff.length} staff members</p></div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}><Plus size={16} /> Add Staff</button>
      </div>

      <div className="card">
        {isLoading ? <PageSpinner /> : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Name</th><th>Staff ID</th><th>Role</th><th>Department</th><th>Salary</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={`${s.user?.firstName} ${s.user?.lastName}`} size="sm" />
                        <div>
                          <p className="font-medium">{s.user?.firstName} {s.user?.lastName}</p>
                          <p className="text-xs text-gray-400">{s.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-gray-500">{s.staffId}</td>
                    <td><span className="badge badge-primary capitalize">{s.user?.role?.replace('_',' ')}</span></td>
                    <td className="text-gray-500">{s.department || '—'}</td>
                    <td className="font-mono text-sm">₦{Number(s.salary).toLocaleString()}</td>
                    <td><Badge label={s.user?.isActive ? 'Active' : 'Inactive'} /></td>
                    <td><button className="btn btn-ghost btn-sm">View</button></td>
                  </tr>
                ))}
                {!staff.length && <tr><td colSpan={7} className="text-center py-8 text-gray-400">No staff found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Staff Member"
        footer={<><button className="btn btn-ghost" onClick={() => setCreateOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit(d => createMut.mutate(d))} disabled={createMut.isPending}>{createMut.isPending ? 'Creating...' : 'Create Staff'}</button></>}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormGroup label="First Name" required><input className="input" {...register('firstName', { required:true })} /></FormGroup>
            <FormGroup label="Last Name" required><input className="input" {...register('lastName', { required:true })} /></FormGroup>
            <FormGroup label="Email" required><input type="email" className="input" {...register('email', { required:true })} /></FormGroup>
            <FormGroup label="Phone"><input className="input" {...register('phone')} /></FormGroup>
            <FormGroup label="Role" required>
              <select className="select" {...register('role', { required:true })}>
                <option value="">Select role...</option>
                <option value="teacher">Teacher</option>
                <option value="class_teacher">Class Teacher</option>
                <option value="head_teacher">Head Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </FormGroup>
            <FormGroup label="Department"><input className="input" {...register('department')} placeholder="e.g. Primary" /></FormGroup>
            <FormGroup label="Salary (₦)" required><input type="number" className="input" {...register('salary', { required:true })} placeholder="180000" /></FormGroup>
            <FormGroup label="Hire Date"><input type="date" className="input" {...register('hireDate')} /></FormGroup>
          </div>
          <p className="text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">Default password will be <span className="font-mono">EduCore@123</span>. Staff should change it on first login.</p>
        </div>
      </Modal>
    </div>
  );
}
