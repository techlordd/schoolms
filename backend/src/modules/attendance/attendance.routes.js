// src/modules/attendance/attendance.routes.js
const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./attendance.controller');

router.get ('/',                        authenticate, authorize('admin','head_teacher'), ctrl.list);
router.post('/bulk',                    authenticate, authorize('admin','teacher','class_teacher'), ctrl.bulkMark);
router.put ('/:id',                     authenticate, authorize('admin','teacher','class_teacher'), ctrl.update);
router.get ('/class/:classId',          authenticate, ctrl.byClass);
router.get ('/student/:studentId',      authenticate, ctrl.byStudent);
router.get ('/summary/today',           authenticate, authorize('admin','head_teacher'), ctrl.todaySummary);
router.get ('/report/term',             authenticate, authorize('admin','head_teacher'), ctrl.termReport);

module.exports = router;
