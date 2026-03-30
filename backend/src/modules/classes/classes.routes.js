// src/modules/classes/classes.routes.js
const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./classes.controller');
router.get ('/',              authenticate, ctrl.list);
router.post('/',              authenticate, authorize('admin'), ctrl.create);
router.get ('/:id',           authenticate, ctrl.get);
router.put ('/:id',           authenticate, authorize('admin'), ctrl.update);
router.delete('/:id',         authenticate, authorize('admin'), ctrl.remove);
router.get ('/:id/subjects',  authenticate, ctrl.subjects);
router.post('/:id/subjects',  authenticate, authorize('admin','head_teacher'), ctrl.assignSubject);
module.exports = router;
