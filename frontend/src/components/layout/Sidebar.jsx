// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ClipboardList, BarChart2,
  BookOpen, DollarSign, UserCheck, MessageSquare,
  CalendarDays, FolderOpen, Briefcase, LogOut, Settings, GraduationCap
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const NAV = {
  admin: [
    { section: 'Main', items: [
      { to: '/',           label: 'Dashboard',     icon: LayoutDashboard },
      { to: '/students',   label: 'Students',      icon: Users },
      { to: '/attendance', label: 'Attendance',    icon: ClipboardList },
      { to: '/grades',     label: 'Grades & Reports', icon: BarChart2 },
      { to: '/assignments',label: 'Assignments',   icon: BookOpen },
    ]},
    { section: 'Management', items: [
      { to: '/staff',      label: 'Staff & Payroll', icon: UserCheck },
      { to: '/finance',    label: 'Finance',        icon: DollarSign },
      { to: '/calendar',   label: 'Calendar',       icon: CalendarDays },
      { to: '/meetings',   label: 'Staff Meetings', icon: Briefcase },
      { to: '/documents',  label: 'Documents',      icon: FolderOpen },
      { to: '/messages',   label: 'Messages',       icon: MessageSquare },
    ]},
  ],
  head_teacher: [
    { section: 'Oversight', items: [
      { to: '/',           label: 'Dashboard',      icon: LayoutDashboard },
      { to: '/students',   label: 'All Students',   icon: Users },
      { to: '/attendance', label: 'Attendance',     icon: ClipboardList },
      { to: '/grades',     label: 'Results',        icon: BarChart2 },
    ]},
    { section: 'Management', items: [
      { to: '/staff',      label: 'Staff',          icon: UserCheck },
      { to: '/calendar',   label: 'Calendar',       icon: CalendarDays },
      { to: '/meetings',   label: 'Staff Meetings', icon: Briefcase },
      { to: '/documents',  label: 'Documents',      icon: FolderOpen },
      { to: '/messages',   label: 'Messages',       icon: MessageSquare },
    ]},
  ],
  teacher: [
    { section: 'My Work', items: [
      { to: '/',           label: 'Dashboard',      icon: LayoutDashboard },
      { to: '/attendance', label: 'Attendance',     icon: ClipboardList },
      { to: '/assignments',label: 'Assignments',    icon: BookOpen },
      { to: '/grades',     label: 'Enter Scores',   icon: BarChart2 },
    ]},
    { section: 'Other', items: [
      { to: '/calendar',   label: 'Calendar',       icon: CalendarDays },
      { to: '/documents',  label: 'Resources',      icon: FolderOpen },
      { to: '/messages',   label: 'Messages',       icon: MessageSquare },
    ]},
  ],
  class_teacher: [
    { section: 'My Class', items: [
      { to: '/',           label: 'Dashboard',      icon: LayoutDashboard },
      { to: '/students',   label: 'My Students',    icon: Users },
      { to: '/attendance', label: 'Attendance',     icon: ClipboardList },
      { to: '/grades',     label: 'Report Cards',   icon: BarChart2 },
      { to: '/assignments',label: 'Assignments',    icon: BookOpen },
    ]},
    { section: 'Other', items: [
      { to: '/messages',   label: 'Messages',       icon: MessageSquare },
      { to: '/documents',  label: 'Documents',      icon: FolderOpen },
    ]},
  ],
  student: [
    { section: 'My School', items: [
      { to: '/',           label: 'Dashboard',      icon: LayoutDashboard },
      { to: '/grades',     label: 'My Results',     icon: BarChart2 },
      { to: '/attendance', label: 'My Attendance',  icon: ClipboardList },
      { to: '/assignments',label: 'Assignments',    icon: BookOpen },
      { to: '/calendar',   label: 'Calendar',       icon: CalendarDays },
    ]},
  ],
  parent: [
    { section: "My Children", items: [
      { to: '/',           label: 'Dashboard',      icon: LayoutDashboard },
      { to: '/grades',     label: "Results",        icon: BarChart2 },
      { to: '/attendance', label: 'Attendance',     icon: ClipboardList },
      { to: '/finance',    label: 'Fee Payments',   icon: DollarSign },
      { to: '/messages',   label: 'Messages',       icon: MessageSquare },
    ]},
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const navSections = NAV[user?.role] || NAV.admin;

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'U';
  const roleLabel = {
    admin:'Administrator', head_teacher:'Head Teacher',
    teacher:'Teacher', class_teacher:'Class Teacher',
    student:'Student', parent:'Parent',
  }[user?.role] || 'User';

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <aside className="w-56 bg-primary-600 flex flex-col flex-shrink-0 h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-none">EduCore</div>
            <div className="text-white/40 text-xs mt-0.5">SMS</div>
          </div>
        </div>
      </div>

      {/* User badge */}
      <div className="mx-3 my-3 bg-white/10 rounded-xl p-3 flex items-center gap-3">
        <div className="avatar avatar-sm bg-accent text-white flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-white text-xs font-medium truncate">{user?.firstName} {user?.lastName}</div>
          <div className="text-white/40 text-xs">{roleLabel}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navSections.map(section => (
          <div key={section.section} className="mb-2">
            <div className="px-5 py-2 text-white/30 text-xs font-medium uppercase tracking-wider">
              {section.section}
            </div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'active' : ''}`
                }
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 p-3 flex flex-col gap-1">
        <NavLink to="/profile" className="sidebar-item">
          <Settings size={16} />
          <span>Settings</span>
        </NavLink>
        <button onClick={handleLogout} className="sidebar-item w-full text-left">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
