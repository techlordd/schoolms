// src/pages/attendance/AttendancePage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi, classesApi } from '../../api/endpoints';
import { PageSpinner, StatCard, Badge } from '../../components/ui';
import { CalendarCheck, UserX, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import useAuthStore from '../../store/authStore';

export default function AttendancePage() {
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const isStaff = ['admin','teacher','class_teacher','head_teacher'].includes(user?.role);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [marks, setMarks] = useState({});

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.list().then(r => r.data.data),
    enabled: isStaff,
  });

  const { data: students, isLoading } = useQuery({
    queryKey: ['attendance-class', classId, date],
    queryFn: async () => {
      const [studs, att] = await Promise.all([
        classesId ? import('../../api/endpoints').then(m => m.studentsApi.byClass(classId).then(r => r.data.data)) : Promise.resolve([]),
        attendanceApi.byClass(classId, { date }).then(r => r.data.data),
      ]);
      // Merge attendance into students
      const attMap = {};
      att.forEach(a => { attMap[a.studentId] = a.status; });
      return studs.map(s => ({ ...s, status: attMap[s.id] || '' }));
    },
    enabled: !!classId,
  });

  const { data: summary } = useQuery({
    queryKey: ['today-summary'],
    queryFn: () => attendanceApi.todaySummary().then(r => r.data.data),
    enabled: isStaff && (user?.role === 'admin' || user?.role === 'head_teacher'),
  });

  const saveMut = useMutation({
    mutationFn: () => attendanceApi.bulkMark({
      classId, date,
      records: (students || []).map(s => ({ studentId: s.id, status: marks[s.id] || s.status || 'present' })),
      term: 2, academicYear: '2024/2025',
    }),
    onSuccess: () => { toast.success('Attendance saved'); qc.invalidateQueries(['attendance-class']); },
    onError: () => toast.error('Failed to save attendance'),
  });

  const setStatus = (studentId, status) => setMarks(m => ({ ...m, [studentId]: status }));

  const STATUS_COLORS = { present: 'bg-green-100 text-green-700 border-green-200', absent: 'bg-red-100 text-red-700 border-red-200', late: 'bg-yellow-100 text-yellow-700 border-yellow-200', '': 'bg-gray-100 text-gray-500 border-gray-200' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Present Today"  value={summary.present}  icon={CalendarCheck} color="green" />
          <StatCard label="Absent Today"   value={summary.absent}   icon={UserX}         color="red" />
          <StatCard label="Late Today"     value={summary.late}     icon={Clock}         color="amber" />
        </div>
      )}

      {isStaff && (
        <div className="card mb-5">
          <div className="card-body flex gap-3">
            <select className="select w-48" value={classId} onChange={e => setClassId(e.target.value)}>
              <option value="">Select class...</option>
              {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="date" className="input w-44" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
      )}

      {classId && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Mark Attendance — {classes?.find(c=>c.id===classId)?.name}</h3>
            <div className="flex gap-2 text-xs text-gray-500">
              <span className="text-green-600 font-medium">{Object.values(marks).filter(s=>s==='present').length + (students?.filter(s=>!marks[s.id]&&s.status==='present').length||0)} P</span>
              <span className="text-red-600 font-medium">{Object.values(marks).filter(s=>s==='absent').length + (students?.filter(s=>!marks[s.id]&&s.status==='absent').length||0)} A</span>
              <span className="text-yellow-600 font-medium">{Object.values(marks).filter(s=>s==='late').length + (students?.filter(s=>!marks[s.id]&&s.status==='late').length||0)} L</span>
            </div>
          </div>
          {isLoading ? <PageSpinner /> : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>#</th><th>Student</th><th>ID</th><th>Status</th></tr></thead>
                  <tbody>
                    {students?.map((s, i) => {
                      const cur = marks[s.id] || s.status || '';
                      return (
                        <tr key={s.id}>
                          <td className="font-mono text-xs text-gray-400">{String(i+1).padStart(2,'0')}</td>
                          <td className="font-medium">{s.firstName} {s.lastName}</td>
                          <td className="font-mono text-xs text-gray-400">{s.studentId}</td>
                          <td>
                            <div className="flex gap-1.5">
                              {['present','absent','late'].map(st => (
                                <button key={st} onClick={() => setStatus(s.id, st)}
                                  className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${cur===st ? STATUS_COLORS[st] : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'}`}>
                                  {st[0].toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">{students?.length || 0} students</p>
                <button className="btn btn-primary" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
                  {saveMut.isPending ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
