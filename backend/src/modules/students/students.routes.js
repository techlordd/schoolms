// src/modules/students/students.routes.js
const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./students.controller');

const staffRoles = ['admin','head_teacher','teacher','class_teacher'];

router.get ('/',                  authenticate, authorize(...staffRoles), ctrl.list);
router.post('/',                  authenticate, authorize('admin'), ctrl.create);
router.get ('/:id',               authenticate, ctrl.get);
router.put ('/:id',               authenticate, authorize('admin','head_teacher'), ctrl.update);
router.delete('/:id',             authenticate, authorize('admin'), ctrl.remove);
router.get ('/:id/attendance',    authenticate, ctrl.getAttendance);
router.get ('/:id/results',       authenticate, ctrl.getResults);
router.get ('/:id/report-card',   authenticate, ctrl.getReportCard);
router.post('/:id/transfer',      authenticate, authorize('admin'), ctrl.transfer);
router.get ('/class/:classId',    authenticate, authorize(...staffRoles), ctrl.byClass);

module.exports = router;
