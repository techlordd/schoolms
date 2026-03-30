// src/pages/dashboard/DashboardPage.jsx
import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, CalendarCheck, DollarSign, TrendingUp, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { dashboardApi } from '../../api/endpoints';
import useAuthStore from '../../store/authStore';
import { StatCard, PageSpinner, Badge, Avatar } from '../../components/ui';
import { format } from 'date-fns';

function AdminDashboard({ data }) {
  const { stats, todayAttendance, feeStats, recentStudents, announcements, upcomingEvents, weeklyAttendance } = data;

  // Shape weekly chart data
  const chartData = (() => {
    const map = {};
    (weeklyAttendance||[]).forEach(r => {
      if (!map[r.date]) map[r.date] = { date: r.date.slice(5), present:0, absent:0, late:0 };
      map[r.date][r.status] = r.count;
    });
    return Object.values(map).slice(-5);
  })();

  const collectionPct = feeStats?.due ? Math.round(feeStats.collected / feeStats.due * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students"   value={stats?.totalStudents} icon={Users}        color="primary" sub="Currently enrolled" />
        <StatCard label="Teaching Staff"   value={stats?.totalStaff}    icon={UserCheck}     color="blue"    sub="Active staff" />
        <StatCard label="Attendance Today" value={`${stats?.attendancePct ?? 0}%`} icon={CalendarCheck} color="green" sub={`${todayAttendance?.present} present`} />
        <StatCard label="Fees Outstanding" value={`₦${((feeStats?.due - feeStats?.collected)/1000||0).toFixed(0)}k`} icon={DollarSign} color="red" sub={`${collectionPct}% collected`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly attendance chart */}
        <div className="card lg:col-span-2">
          <div className="card-header"><h3 className="card-title">Weekly Attendance</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize:11 }} />
                <YAxis tick={{ fontSize:11 }} />
                <Tooltip contentStyle={{ fontSize:12, borderRadius:8 }} />
                <Bar dataKey="present" fill="#1a5f4a" radius={[3,3,0,0]} name="Present" />
                <Bar dataKey="absent"  fill="#fecaca" radius={[3,3,0,0]} name="Absent" />
                <Bar dataKey="late"    fill="#fde68a" radius={[3,3,0,0]} name="Late" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming events */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Upcoming Events</h3></div>
          <div className="divide-y divide-gray-50">
            {upcomingEvents?.length ? upcomingEvents.map(ev => (
              <div key={ev.id} className="px-4 py-3 flex gap-3 items-start">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-600">
                  {format(new Date(ev.startDate), 'dd')}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700 leading-snug">{ev.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{format(new Date(ev.startDate), 'MMM d')}</p>
                </div>
              </div>
            )) : <div className="px-4 py-6 text-xs text-gray-400">No upcoming events</div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent enrollments */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Enrollments</h3>
            <a href="/students" className="text-xs text-primary-600 font-medium hover:underline">View all</a>
          </div>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Student</th><th>Class</th><th>Enrolled</th><th>Status</th></tr></thead>
              <tbody>
                {recentStudents?.map(s => (
                  <tr key={s.id}>
                    <td><div className="flex items-center gap-2"><Avatar name={`${s.firstName} ${s.lastName}`} size="sm" /><span className="font-medium">{s.firstName} {s.lastName}</span></div></td>
                    <td className="text-gray-500">{s.class?.name}</td>
                    <td className="text-gray-500">{format(new Date(s.enrolledAt), 'MMM d')}</td>
                    <td><Badge label="Active" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Announcements */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Announcements</h3></div>
          <div className="divide-y divide-gray-50">
            {announcements?.map(a => (
              <div key={a.id} className="px-4 py-3">
                <p className="text-xs font-medium text-gray-700">{a.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {a.author?.firstName} {a.author?.lastName} · {format(new Date(a.createdAt), 'MMM d')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeacherDashboard({ data }) {
  const { myClasses, pendingAssignments, recentLogs } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="My Classes"   value={[...new Set(myClasses?.map(c=>c.classId))].length} icon={Users} color="primary" />
        <StatCard label="My Subjects"  value={myClasses?.length} icon={BookOpen} color="blue" />
        <StatCard label="Due Assignments" value={pendingAssignments?.length} icon={TrendingUp} color="amber" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header"><h3 className="card-title">Pending Assignments</h3></div>
          <div className="divide-y divide-gray-50">
            {pendingAssignments?.map(a => (
              <div key={a.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-700">{a.title}</p>
                  <p className="text-xs text-gray-400">{a.class?.name} · {a.subject?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{format(new Date(a.dueDate), 'MMM d')}</p>
                  <p className="text-xs text-gray-400">{a._count?.submissions} submitted</p>
                </div>
              </div>
            ))}
            {!pendingAssignments?.length && <div className="px-4 py-6 text-xs text-gray-400">No pending assignments</div>}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Recent Teaching Log</h3></div>
          <div className="divide-y divide-gray-50">
            {recentLogs?.map(l => (
              <div key={l.id} className="px-4 py-3">
                <p className="text-xs font-medium text-gray-700">{l.topic}</p>
                <p className="text-xs text-gray-400">{l.class?.name} · {l.subject?.name} · {format(new Date(l.date), 'MMM d')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentDashboard({ data }) {
  const { student, results, attSummary, avgScore, assignments, announcements } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Average Score"   value={`${avgScore}%`} color="primary" icon={TrendingUp} />
        <StatCard label="Attendance"      value={`${attSummary?.pct}%`} color="green" icon={CalendarCheck} sub={`${attSummary?.absent} absences`} />
        <StatCard label="Subjects"        value={results?.length} color="blue" icon={BookOpen} />
        <StatCard label="Assignments Due" value={assignments?.length} color="amber" icon={BookOpen} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header"><h3 className="card-title">My Results — Term 2</h3></div>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Subject</th><th>Score</th><th>Grade</th></tr></thead>
              <tbody>
                {results?.map(r => (
                  <tr key={r.id}>
                    <td>{r.subject?.name}</td>
                    <td className="font-mono text-sm">{Number(r.totalScore).toFixed(0)}</td>
                    <td><Badge label={r.grade} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Upcoming Assignments</h3></div>
          <div className="divide-y divide-gray-50">
            {assignments?.map(a => (
              <div key={a.id} className="px-4 py-3">
                <p className="text-xs font-medium text-gray-700">{a.title}</p>
                <p className="text-xs text-gray-400">{a.subject?.name} · Due {format(new Date(a.dueDate), 'MMM d')}</p>
              </div>
            ))}
            {!assignments?.length && <div className="px-4 py-6 text-xs text-gray-400">No upcoming assignments</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ParentDashboard({ data }) {
  const { children } = data;
  return (
    <div className="space-y-6">
      {children?.map(c => {
        const s = c.student;
        return (
          <div key={c.studentId} className="card">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <Avatar name={`${s.firstName} ${s.lastName}`} size="md" />
                <div>
                  <p className="font-semibold text-sm text-gray-800">{s.firstName} {s.lastName}</p>
                  <p className="text-xs text-gray-400">{s.class?.name} · {s.studentId}</p>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-primary-50 rounded-xl">
                  <div className="text-lg font-bold text-primary-700 font-mono">{s.avgScore}%</div>
                  <div className="text-xs text-gray-500 mt-1">Avg Score</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <div className="text-lg font-bold text-green-700 font-mono">{s.attSummary?.pct}%</div>
                  <div className="text-xs text-gray-500 mt-1">Attendance</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-xl">
                  <div className="text-lg font-bold text-red-700 font-mono">₦{(s.feeBalance/1000||0).toFixed(0)}k</div>
                  <div className="text-xs text-gray-500 mt-1">Fee Balance</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const role = user?.role;

  const endpoint = {
    admin: 'admin', head_teacher: 'admin',
    teacher: 'teacher', class_teacher: 'teacher',
    student: 'student', parent: 'parent',
  }[role] || 'admin';

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', endpoint],
    queryFn: () => dashboardApi[endpoint]().then(r => r.data.data),
    staleTime: 30000,
  });

  if (isLoading) return <PageSpinner />;
  if (error) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-gray-500">Failed to load dashboard. Please refresh.</p>
    </div>
  );
  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Good morning, {user?.firstName} 👋</h1>
          <p className="page-subtitle">Here's what's happening at your school today.</p>
        </div>
      </div>
      {(role === 'admin' || role === 'head_teacher') && <AdminDashboard data={data} />}
      {(role === 'teacher' || role === 'class_teacher') && <TeacherDashboard data={data} />}
      {role === 'student' && <StudentDashboard data={data} />}
      {role === 'parent'  && <ParentDashboard data={data} />}
    </div>
  );
}
