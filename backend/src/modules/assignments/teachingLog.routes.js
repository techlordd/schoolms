// src/modules/assignments/teachingLog.routes.js
const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./teachingLog.controller');
router.get ('/', authenticate, ctrl.list);
router.post('/', authenticate, authorize('admin','teacher','class_teacher'), ctrl.create);
router.put ('/:id', authenticate, authorize('admin','teacher','class_teacher'), ctrl.update);
module.exports = router;
