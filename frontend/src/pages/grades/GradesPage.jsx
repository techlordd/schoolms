// src/pages/grades/GradesPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resultsApi, classesApi } from '../../api/endpoints';
import { PageSpinner, Badge, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

export default function GradesPage() {
  const qc = useQueryClient();
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [localScores, setLocalScores] = useState({});

  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: () => classesApi.list().then(r => r.data.data) });
  const selectedClass = classes?.find(c => c.id === classId);

  const { data: results, isLoading } = useQuery({
    queryKey: ['results', classId, subjectId],
    queryFn: () => resultsApi.byClass(classId, { subjectId, term:2, academicYear:'2024/2025' }).then(r => r.data.data),
    enabled: !!classId,
  });

  const saveMut = useMutation({
    mutationFn: () => {
      const scores = Object.entries(localScores).map(([key, vals]) => {
        const [studentId] = key.split('_');
        return { studentId, subjectId, ...vals };
      });
      return resultsApi.bulkUpsert({ classId, scores, term:2, academicYear:'2024/2025' });
    },
    onSuccess: () => { toast.success('Scores saved'); qc.invalidateQueries(['results']); setLocalScores({}); },
    onError: () => toast.error('Failed to save scores'),
  });

  const setValue = (studentId, field, value) => {
    setLocalScores(prev => ({
      ...prev,
      [`${studentId}_${subjectId}`]: { ...(prev[`${studentId}_${subjectId}`] || {}), [field]: value },
    }));
  };

  const getVal = (studentId, field, fallback) => {
    const k = `${studentId}_${subjectId}`;
    return localScores[k]?.[field] ?? fallback ?? '';
  };

  const gradeColor = g => ({ 'A+':'badge-green', A:'badge-green', B:'badge-blue', C:'badge-yellow', D:'badge-red', F:'badge-red' }[g] || 'badge-gray');

  // Deduplicate students from results
  const studentMap = {};
  results?.forEach(r => { if (!studentMap[r.studentId]) studentMap[r.studentId] = r; });
  const rows = Object.values(studentMap);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Grades & Results</h1><p className="page-subtitle">Term 2 — 2024/2025</p></div>
      </div>

      <div className="card mb-5">
        <div className="card-body flex gap-3">
          <select className="select w-44" value={classId} onChange={e => setClassId(e.target.value)}>
            <option value="">Select class...</option>
            {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="select w-48" value={subjectId} onChange={e => setSubjectId(e.target.value)} disabled={!classId}>
            <option value="">Select subject...</option>
            {selectedClass?.classSubjects?.map(cs => <option key={cs.subjectId} value={cs.subjectId}>{cs.subject?.name}</option>)}
          </select>
        </div>
      </div>

      {classId && subjectId ? (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Enter Scores — {selectedClass?.name}</h3>
            <button className="btn btn-primary btn-sm" onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !Object.keys(localScores).length}>
              {saveMut.isPending ? 'Saving...' : 'Save All Scores'}
            </button>
          </div>
          {isLoading ? <PageSpinner /> : (
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Student</th><th>CA1 /20</th><th>CA2 /20</th><th>Exam /60</th><th>Total</th><th>Grade</th></tr></thead>
                <tbody>
                  {rows.map(r => {
                    const ca1  = parseFloat(getVal(r.studentId, 'ca1Score', r.ca1Score)) || 0;
                    const ca2  = parseFloat(getVal(r.studentId, 'ca2Score', r.ca2Score)) || 0;
                    const exam = parseFloat(getVal(r.studentId, 'examScore', r.examScore)) || 0;
                    const total = ca1 + ca2 + exam;
                    const grade = total>=90?'A+':total>=80?'A':total>=70?'B':total>=60?'C':total>=50?'D':'F';
                    return (
                      <tr key={r.studentId}>
                        <td className="font-medium">{r.student?.firstName} {r.student?.lastName}</td>
                        {['ca1Score','ca2Score','examScore'].map(f => (
                          <td key={f}>
                            <input type="number" min="0" max={f==='examScore'?60:20}
                              className="input w-16 text-center font-mono text-sm py-1"
                              value={getVal(r.studentId, f, r[f])}
                              onChange={e => setValue(r.studentId, f, e.target.value)} />
                          </td>
                        ))}
                        <td className="font-mono font-semibold">{total.toFixed(0)}</td>
                        <td><span className={`badge ${gradeColor(grade)}`}>{grade}</span></td>
                      </tr>
                    );
                  })}
                  {!rows.length && <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No students found in this class</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <EmptyState icon="📊" title="Select a class and subject" description="Choose a class and subject above to enter or view scores." />
      )}
    </div>
  );
}
