// src/routes.js
const router = require('express').Router();

router.use('/auth',          require('./modules/auth/auth.routes'));
router.use('/students',      require('./modules/students/students.routes'));
router.use('/classes',       require('./modules/classes/classes.routes'));
router.use('/attendance',    require('./modules/attendance/attendance.routes'));
router.use('/assignments',   require('./modules/assignments/assignments.routes'));
router.use('/results',       require('./modules/results/results.routes'));
router.use('/report-cards',  require('./modules/results/reportCards.routes'));
router.use('/finance',       require('./modules/finance/finance.routes'));
router.use('/staff',         require('./modules/staff/staff.routes'));
router.use('/payroll',       require('./modules/payroll/payroll.routes'));
router.use('/messages',      require('./modules/messages/messages.routes'));
router.use('/announcements', require('./modules/announcements/announcements.routes'));
router.use('/calendar',      require('./modules/calendar/calendar.routes'));
router.use('/documents',     require('./modules/documents/documents.routes'));
router.use('/staff-meetings',require('./modules/staff-meetings/staffMeetings.routes'));
router.use('/teaching-log',  require('./modules/assignments/teachingLog.routes'));
router.use('/dashboard',     require('./modules/dashboard/dashboard.routes'));

module.exports = router;
