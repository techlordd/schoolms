// src/modules/documents/documents.routes.js
const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./documents.controller');
const staffRoles = ['admin','head_teacher','teacher','class_teacher'];

router.get ('/',              authenticate, authorize('admin','head_teacher'), ctrl.list);
router.post('/',              authenticate, authorize(...staffRoles), ctrl.upload);
router.get ('/:id',           authenticate, ctrl.get);
router.delete('/:id',         authenticate, authorize('admin'), ctrl.remove);
router.get ('/student/:id',   authenticate, ctrl.byStudent);
router.get ('/staff/:id',     authenticate, authorize('admin','head_teacher'), ctrl.byStaff);
module.exports = router;
