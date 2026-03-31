// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import LandingPage from './pages/landing/LandingPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import StudentsPage from './pages/students/StudentsPage';
import StudentDetailPage from './pages/students/StudentDetailPage';
import EnrollPage from './pages/students/EnrollPage';
import AttendancePage from './pages/attendance/AttendancePage';
import GradesPage from './pages/grades/GradesPage';
import ReportCardPage from './pages/grades/ReportCardPage';
import AssignmentsPage from './pages/assignments/AssignmentsPage';
import FinancePage from './pages/finance/FinancePage';
import StaffPage from './pages/staff/StaffPage';
import MessagesPage from './pages/messages/MessagesPage';
import CalendarPage from './pages/calendar/CalendarPage';
import DocumentsPage from './pages/documents/DocumentsPage';
import MeetingsPage from './pages/meetings/MeetingsPage';
import ProfilePage from './pages/auth/ProfilePage';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const LandingRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingRoute><LandingPage /></LandingRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/enroll" element={<EnrollPage />} />
          <Route path="students/:id" element={<StudentDetailPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="grades" element={<GradesPage />} />
          <Route path="grades/report-card/:studentId" element={<ReportCardPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="meetings" element={<MeetingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
