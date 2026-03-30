// src/api/endpoints.js
import api from './client';

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:          (data)         => api.post('/auth/login', data),
  logout:         ()             => api.post('/auth/logout'),
  me:             ()             => api.get('/auth/me'),
  updateMe:       (data)         => api.put('/auth/me', data),
  changePassword: (data)         => api.put('/auth/me/password', data),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  admin:   () => api.get('/dashboard/admin'),
  teacher: () => api.get('/dashboard/teacher'),
  student: () => api.get('/dashboard/student'),
  parent:  () => api.get('/dashboard/parent'),
};

// ── Students ──────────────────────────────────────────────────────────────────
export const studentsApi = {
  list:        (params) => api.get('/students', { params }),
  get:         (id)     => api.get(`/students/${id}`),
  create:      (data)   => api.post('/students', data),
  update:      (id, data) => api.put(`/students/${id}`, data),
  remove:      (id)     => api.delete(`/students/${id}`),
  byClass:     (classId)=> api.get(`/students/class/${classId}`),
  transfer:    (id, data)=> api.post(`/students/${id}/transfer`, data),
  attendance:  (id, p)  => api.get(`/students/${id}/attendance`, { params: p }),
  results:     (id, p)  => api.get(`/students/${id}/results`, { params: p }),
  reportCard:  (id, p)  => api.get(`/students/${id}/report-card`, { params: p }),
};

// ── Classes ───────────────────────────────────────────────────────────────────
export const classesApi = {
  list:          (params) => api.get('/classes', { params }),
  get:           (id)     => api.get(`/classes/${id}`),
  create:        (data)   => api.post('/classes', data),
  update:        (id, d)  => api.put(`/classes/${id}`, d),
  remove:        (id)     => api.delete(`/classes/${id}`),
  subjects:      (id)     => api.get(`/classes/${id}/subjects`),
  assignSubject: (id, d)  => api.post(`/classes/${id}/subjects`, d),
};

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendanceApi = {
  list:        (params) => api.get('/attendance', { params }),
  bulkMark:    (data)   => api.post('/attendance/bulk', data),
  update:      (id, d)  => api.put(`/attendance/${id}`, d),
  byClass:     (id, p)  => api.get(`/attendance/class/${id}`, { params: p }),
  byStudent:   (id, p)  => api.get(`/attendance/student/${id}`, { params: p }),
  todaySummary:()       => api.get('/attendance/summary/today'),
  termReport:  (params) => api.get('/attendance/report/term', { params }),
};

// ── Assignments ───────────────────────────────────────────────────────────────
export const assignmentsApi = {
  list:        (params) => api.get('/assignments', { params }),
  get:         (id)     => api.get(`/assignments/${id}`),
  create:      (data)   => api.post('/assignments', data),
  update:      (id, d)  => api.put(`/assignments/${id}`, d),
  remove:      (id)     => api.delete(`/assignments/${id}`),
  submit:      (id, d)  => api.post(`/assignments/${id}/submit`, d),
  submissions: (id)     => api.get(`/assignments/${id}/submissions`),
  grade:       (subId, d) => api.put(`/assignments/submissions/${subId}/grade`, d),
};

// ── Teaching Log ──────────────────────────────────────────────────────────────
export const teachingLogApi = {
  list:   (params) => api.get('/teaching-log', { params }),
  create: (data)   => api.post('/teaching-log', data),
  update: (id, d)  => api.put(`/teaching-log/${id}`, d),
};

// ── Results ───────────────────────────────────────────────────────────────────
export const resultsApi = {
  list:             (params) => api.get('/results', { params }),
  bulkUpsert:       (data)   => api.post('/results/bulk', data),
  update:           (id, d)  => api.put(`/results/${id}`, d),
  byClass:          (id, p)  => api.get(`/results/class/${id}`, { params: p }),
  byStudent:        (id, p)  => api.get(`/results/student/${id}`, { params: p }),
  computePositions: (data)   => api.post('/results/compute-positions', data),
};

// ── Report Cards ──────────────────────────────────────────────────────────────
export const reportCardsApi = {
  generate:    (data)   => api.post('/report-cards/generate', data),
  get:         (studentId, p) => api.get(`/report-cards/${studentId}`, { params: p }),
  publish:     (id)     => api.put(`/report-cards/${id}/publish`),
  addComments: (id, d)  => api.put(`/report-cards/${id}/comments`, d),
  pdf:         (id)     => api.get(`/report-cards/${id}/pdf`),
};

// ── Finance ───────────────────────────────────────────────────────────────────
export const financeApi = {
  dashboard:        (p)     => api.get('/finance/dashboard', { params: p }),
  listPayments:     (p)     => api.get('/finance/payments', { params: p }),
  recordPayment:    (data)  => api.post('/finance/payments', data),
  studentPayments:  (id)    => api.get(`/finance/payments/${id}`),
  outstanding:      (p)     => api.get('/finance/outstanding', { params: p }),
  feeStructures:    (p)     => api.get('/finance/fee-structures', { params: p }),
  createFeeStructure:(data) => api.post('/finance/fee-structures', data),
  listExpenses:     (p)     => api.get('/finance/expenses', { params: p }),
  recordExpense:    (data)  => api.post('/finance/expenses', data),
  report:           (p)     => api.get('/finance/report', { params: p }),
};

// ── Staff ─────────────────────────────────────────────────────────────────────
export const staffApi = {
  list:   (params) => api.get('/staff', { params }),
  get:    (id)     => api.get(`/staff/${id}`),
  create: (data)   => api.post('/staff', data),
  update: (id, d)  => api.put(`/staff/${id}`, d),
  remove: (id)     => api.delete(`/staff/${id}`),
};

// ── Payroll ───────────────────────────────────────────────────────────────────
export const payrollApi = {
  list:    (params) => api.get('/payroll', { params }),
  run:     (data)   => api.post('/payroll/run', data),
  byStaff: (id)     => api.get(`/payroll/${id}`),
  payslip: (id)     => api.get(`/payroll/${id}/payslip`),
};

// ── Messages ──────────────────────────────────────────────────────────────────
export const messagesApi = {
  inbox:    (params) => api.get('/messages', { params }),
  send:     (data)   => api.post('/messages', data),
  thread:   (id)     => api.get(`/messages/${id}`),
  markRead: (id)     => api.put(`/messages/${id}/read`),
  remove:   (id)     => api.delete(`/messages/${id}`),
};

// ── Announcements ─────────────────────────────────────────────────────────────
export const announcementsApi = {
  list:   (params) => api.get('/announcements', { params }),
  create: (data)   => api.post('/announcements', data),
  update: (id, d)  => api.put(`/announcements/${id}`, d),
  remove: (id)     => api.delete(`/announcements/${id}`),
};

// ── Calendar ──────────────────────────────────────────────────────────────────
export const calendarApi = {
  list:   (params) => api.get('/calendar', { params }),
  create: (data)   => api.post('/calendar', data),
  update: (id, d)  => api.put(`/calendar/${id}`, d),
  remove: (id)     => api.delete(`/calendar/${id}`),
};

// ── Documents ─────────────────────────────────────────────────────────────────
export const documentsApi = {
  list:      (params) => api.get('/documents', { params }),
  upload:    (data)   => api.post('/documents', data),
  get:       (id)     => api.get(`/documents/${id}`),
  remove:    (id)     => api.delete(`/documents/${id}`),
  byStudent: (id)     => api.get(`/documents/student/${id}`),
  byStaff:   (id)     => api.get(`/documents/staff/${id}`),
};

// ── Staff Meetings ────────────────────────────────────────────────────────────
export const staffMeetingsApi = {
  list:   (params) => api.get('/staff-meetings', { params }),
  create: (data)   => api.post('/staff-meetings', data),
  get:    (id)     => api.get(`/staff-meetings/${id}`),
  update: (id, d)  => api.put(`/staff-meetings/${id}`, d),
  remove: (id)     => api.delete(`/staff-meetings/${id}`),
};
