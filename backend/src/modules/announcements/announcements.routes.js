// src/modules/announcements/announcements.routes.js
const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./announcements.controller');
router.get ('/', authenticate, ctrl.list);
router.post('/', authenticate, authorize('admin','head_teacher'), ctrl.create);
router.put ('/:id', authenticate, authorize('admin','head_teacher'), ctrl.update);
router.delete('/:id', authenticate, authorize('admin','head_teacher'), ctrl.remove);
module.exports = router;
