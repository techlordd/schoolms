// src/pages/grades/ReportCardPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download } from 'lucide-react';
import { reportCardsApi } from '../../api/endpoints';
import { PageSpinner, Badge, Avatar } from '../../components/ui';

export default function ReportCardPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['report-card', studentId],
    queryFn: () => reportCardsApi.get(studentId, { term:2, academicYear:'2024/2025' }).then(r => r.data.data),
  });

  if (isLoading) return <PageSpinner />;
  const { card, results } = data || {};

  return (
    <div className="max-w-2xl">
      <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-5" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Report card header */}
      <div className="bg-primary-600 rounded-2xl p-6 mb-5 text-white">
        <div className="flex items-start gap-4 mb-6">
          <Avatar name={card ? `${card.student?.firstName} ${card.student?.lastName}` : ''} size="lg" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{card?.student?.firstName} {card?.student?.lastName}</h2>
            <p className="text-white/60 text-sm mt-0.5">{card?.class?.name} · Term {card?.term} · {card?.academicYear}</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors">
            <Download size={13} /> Export PDF
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[['Average', `${Number(card?.averageScore||0).toFixed(1)}%`], ['Position', card?.classPosition ? `${card.classPosition}${card.classPosition===1?'st':card.classPosition===2?'nd':card.classPosition===3?'rd':'th'}` : '—'], ['Class Size', card?.classSize || '—']].map(([l,v]) => (
            <div key={l} className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold font-mono leading-none">{v}</div>
              <div className="text-white/50 text-xs mt-1.5">{l}</div>
            </div>
          ))}
        </div>

        {results?.map(r => (
          <div key={r.id} className="flex items-center gap-3 mb-2">
            <div className="text-white/80 text-xs w-32 truncate">{r.subject?.name}</div>
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(Number(r.totalScore||0), 100)}%` }} />
            </div>
            <div className="font-mono text-sm font-semibold w-8 text-right">{Number(r.totalScore||0).toFixed(0)}</div>
            <div className="w-8 text-xs text-white/60">{r.grade}</div>
          </div>
        ))}
      </div>

      {/* Comments */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">Teacher Comments</h3></div>
        <div className="card-body space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Class Teacher</p>
            <p className="text-sm text-gray-700 italic">{card?.classTeacherComment || 'No comment added yet.'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Head Teacher</p>
            <p className="text-sm text-gray-700 italic">{card?.headComment || 'No comment added yet.'}</p>
          </div>
          {card?.nextTermBegins && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">Next term begins: <span className="font-medium text-gray-600">{new Date(card.nextTermBegins).toDateString()}</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
