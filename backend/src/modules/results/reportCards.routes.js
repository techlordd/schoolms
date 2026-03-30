// src/modules/results/reportCards.routes.js
const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./reportCards.controller');

router.post('/generate',         authenticate, authorize('admin','head_teacher'), ctrl.generate);
router.get ('/:studentId',       authenticate, ctrl.get);
router.put ('/:id/publish',      authenticate, authorize('admin','head_teacher'), ctrl.publish);
router.put ('/:id/comments',     authenticate, authorize('admin','head_teacher','class_teacher'), ctrl.addComments);
router.get ('/:id/pdf',          authenticate, ctrl.pdf);

module.exports = router;
