// src/modules/assignments/assignments.routes.js
const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./assignments.controller');

router.get ('/',              authenticate, ctrl.list);
router.post('/',              authenticate, authorize('admin','teacher','class_teacher'), ctrl.create);
router.get ('/:id',           authenticate, ctrl.get);
router.put ('/:id',           authenticate, authorize('admin','teacher','class_teacher'), ctrl.update);
router.delete('/:id',         authenticate, authorize('admin','teacher','class_teacher'), ctrl.remove);
router.post('/:id/submit',    authenticate, authorize('student'), ctrl.submit);
router.get ('/:id/submissions', authenticate, authorize('admin','teacher','class_teacher'), ctrl.submissions);
router.put ('/submissions/:subId/grade', authenticate, authorize('admin','teacher','class_teacher'), ctrl.grade);

module.exports = router;
