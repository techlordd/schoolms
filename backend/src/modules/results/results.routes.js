// src/modules/results/results.routes.js
const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./results.controller');

router.get ('/',                      authenticate, authorize('admin','head_teacher'), ctrl.list);
router.post('/bulk',                  authenticate, authorize('admin','teacher','class_teacher'), ctrl.bulkUpsert);
router.put ('/:id',                   authenticate, authorize('admin','teacher','class_teacher'), ctrl.update);
router.get ('/class/:classId',        authenticate, ctrl.byClass);
router.get ('/student/:studentId',    authenticate, ctrl.byStudent);
router.post('/compute-positions',     authenticate, authorize('admin','head_teacher'), ctrl.computePositions);

module.exports = router;
