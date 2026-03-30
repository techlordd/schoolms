// src/modules/staff-meetings/staffMeetings.routes.js
const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./staffMeetings.controller');
router.get ('/',    authenticate, ctrl.list);
router.post('/',    authenticate, authorize('admin','head_teacher'), ctrl.create);
router.get ('/:id', authenticate, ctrl.get);
router.put ('/:id', authenticate, authorize('admin','head_teacher'), ctrl.update);
router.delete('/:id', authenticate, authorize('admin'), ctrl.remove);
module.exports = router;
