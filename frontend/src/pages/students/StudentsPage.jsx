// src/pages/students/StudentsPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { studentsApi, classesApi } from '../../api/endpoints';
import { Avatar, Badge, PageSpinner, Pagination, EmptyState, ConfirmDialog } from '../../components/ui';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function StudentsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('');
  const [page, setPage] = useState(1);
  const [confirmId, setConfirmId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['students', { search, classId, page }],
    queryFn: () => studentsApi.list({ search, classId, page, limit: 20 }).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.list().then(r => r.data.data),
  });

  const removeMut = useMutation({
    mutationFn: id => studentsApi.remove(id),
    onSuccess: () => { toast.success('Student deactivated'); qc.invalidateQueries(['students']); setConfirmId(null); },
    onError: () => toast.error('Failed to deactivate student'),
  });

  const students = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{pagination?.total ?? 0} students enrolled</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/students/enroll')}>
          <Plus size={16} /> Enroll Student
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-5">
        <div className="card-body flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-8" placeholder="Search by name or ID…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="select w-44" value={classId} onChange={e => { setClassId(e.target.value); setPage(1); }}>
            <option value="">All Classes</option>
            {classesData?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? <PageSpinner /> : students.length === 0 ? (
          <EmptyState icon="👥" title="No students found" description="Try adjusting your filters or enroll a new student."
            action={<button className="btn btn-primary" onClick={() => navigate('/students/enroll')}><Plus size={16} /> Enroll Student</button>} />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th><th>ID</th><th>Class</th><th>Gender</th>
                    <th>Parent</th><th>Enrolled</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} className="cursor-pointer" onClick={() => navigate(`/students/${s.id}`)}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={`${s.firstName} ${s.lastName}`} size="sm" />
                          <div>
                            <p className="font-medium text-gray-800">{s.firstName} {s.lastName}</p>
                            <p className="text-xs text-gray-400">{format(new Date(s.dateOfBirth), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-xs text-gray-500">{s.studentId}</td>
                      <td><span className="badge badge-primary">{s.class?.name}</span></td>
                      <td className="capitalize text-gray-500">{s.gender}</td>
                      <td className="text-gray-500">
                        {s.parents?.[0]?.parent ? `${s.parents[0].parent.firstName} ${s.parents[0].parent.lastName}` : '—'}
                      </td>
                      <td className="text-gray-500">{format(new Date(s.enrolledAt), 'MMM d, yyyy')}</td>
                      <td><Badge label={s.isActive ? 'Active' : 'Inactive'} /></td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/students/${s.id}`)}>View</button>
                          <button className="btn btn-ghost btn-sm text-red-500"
                            onClick={() => setConfirmId(s.id)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={pagination?.pages} total={pagination?.total} limit={20} onPage={setPage} />
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => removeMut.mutate(confirmId)}
        title="Deactivate Student" danger
        message="This student will be marked inactive and removed from active rolls. Are you sure?"
      />
    </div>
  );
}
