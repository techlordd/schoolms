// src/pages/students/StudentDetailPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, GraduationCap, Phone, Droplets } from 'lucide-react';
import { studentsApi } from '../../api/endpoints';
import { Avatar, Badge, PageSpinner, SectionHeader } from '../../components/ui';
import { format } from 'date-fns';

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsApi.get(id).then(r => r.data.data),
  });
  const { data: results } = useQuery({
    queryKey: ['student-results', id],
    queryFn: () => studentsApi.results(id, { term:2, academicYear:'2024/2025' }).then(r => r.data.data),
  });
  const { data: attData } = useQuery({
    queryKey: ['student-attendance', id],
    queryFn: () => studentsApi.attendance(id, { term:2 }).then(r => r.data.data),
  });

  if (isLoading) return <PageSpinner />;
  if (!student) return null;

  return (
    <div className="max-w-3xl">
      <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-5" onClick={() => navigate('/students')}>
        <ArrowLeft size={16} /> Back to Students
      </button>

      {/* Header card */}
      <div className="card mb-5">
        <div className="card-body flex items-start gap-5">
          <Avatar name={`${student.firstName} ${student.lastName}`} size="lg" />
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-800">{student.firstName} {student.lastName}</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{student.studentId}</p>
            <div className="flex gap-3 mt-3 flex-wrap">
              <span className="badge badge-primary"><GraduationCap size={10} className="mr-1" />{student.class?.name}</span>
              <span className="badge badge-gray capitalize">{student.gender}</span>
              {student.bloodGroup && <span className="badge badge-red"><Droplets size={10} className="mr-1" />{student.bloodGroup}</span>}
            </div>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Enrolled {format(new Date(student.enrolledAt), 'MMM d, yyyy')}</p>
            <Badge label={student.isActive ? 'Active' : 'Inactive'} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Parent info */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Parent / Guardian</h3></div>
          <div className="card-body divide-y divide-gray-50">
            {student.parents?.length ? student.parents.map((p, i) => (
              <div key={i} className="py-2 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-gray-700">{p.parent.firstName} {p.parent.lastName}</p>
                <p className="text-xs text-gray-400 capitalize">{p.relationship}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <Phone size={11} /> {p.parent.phone || '—'}
                </div>
              </div>
            )) : <p className="text-xs text-gray-400">No parent linked</p>}
          </div>
        </div>

        {/* Attendance summary */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Attendance — Term 2</h3></div>
          <div className="card-body">
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[['Present', attData?.summary?.present, 'text-green-600'],
                ['Absent', attData?.summary?.absent, 'text-red-600'],
                ['Late', attData?.summary?.late, 'text-yellow-600']].map(([l,v,c]) => (
                <div key={l} className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className={`text-lg font-bold font-mono ${c}`}>{v ?? 0}</div>
                  <div className="text-xs text-gray-400">{l}</div>
                </div>
              ))}
            </div>
            <div className="progress">
              <div className="progress-bar" style={{ width: `${attData?.summary?.percentage ?? 0}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">{attData?.summary?.percentage ?? 0}% attendance rate</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Results — Term 2</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/grades/report-card/${id}`)}>View Report Card</button>
        </div>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Subject</th><th>CA1</th><th>CA2</th><th>Exam</th><th>Total</th><th>Grade</th></tr></thead>
            <tbody>
              {results?.map(r => (
                <tr key={r.id}>
                  <td className="font-medium">{r.subject?.name}</td>
                  <td className="font-mono text-sm">{r.ca1Score ?? '—'}</td>
                  <td className="font-mono text-sm">{r.ca2Score ?? '—'}</td>
                  <td className="font-mono text-sm">{r.examScore ?? '—'}</td>
                  <td className="font-mono text-sm font-semibold">{Number(r.totalScore || 0).toFixed(0)}</td>
                  <td><Badge label={r.grade || '—'} /></td>
                </tr>
              ))}
              {!results?.length && <tr><td colSpan={6} className="text-center text-gray-400 py-6">No results yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
