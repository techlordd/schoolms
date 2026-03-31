// src/components/layout/Topbar.jsx
import { Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard', '/dashboard/students': 'Students', '/dashboard/students/enroll': 'Enroll Student',
  '/dashboard/attendance': 'Attendance', '/dashboard/grades': 'Grades & Reports', '/dashboard/assignments': 'Assignments',
  '/dashboard/finance': 'Finance', '/dashboard/staff': 'Staff & Payroll', '/dashboard/messages': 'Messages',
  '/dashboard/calendar': 'School Calendar', '/dashboard/documents': 'Documents', '/dashboard/meetings': 'Staff Meetings',
  '/dashboard/profile': 'My Profile',
};

export default function Topbar() {
  const { user } = useAuthStore();
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'EduCore SMS';

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1">
        <h1 className="text-sm font-semibold text-gray-800">{title}</h1>
      </div>

      <div className="relative hidden md:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-4 py-1.5 text-xs text-gray-700 outline-none focus:border-primary-400 w-52"
          placeholder="Search students, classes..."
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-primary-700 bg-primary-50 border border-primary-100 rounded-full px-3 py-1 font-medium">
        Term {user?.school?.currentTerm || 2} · {user?.school?.currentYear || '2024/25'}
      </div>

      <button className="btn-icon relative">
        <Bell size={17} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
      </button>
    </header>
  );
}
