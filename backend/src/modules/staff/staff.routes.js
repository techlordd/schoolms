// src/modules/staff/staff.routes.js
const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./staff.controller');

router.get ('/',     authenticate, authorize('admin','head_teacher'), ctrl.list);
router.post('/',     authenticate, authorize('admin'), ctrl.create);
router.get ('/:id',  authenticate, authorize('admin','head_teacher'), ctrl.get);
router.put ('/:id',  authenticate, authorize('admin'), ctrl.update);
router.delete('/:id',authenticate, authorize('admin'), ctrl.remove);

module.exports = router;
