// src/modules/payroll/payroll.routes.js
const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./payroll.controller');
router.get ('/',             authenticate, authorize('admin'), ctrl.list);
router.post('/run',          authenticate, authorize('admin'), ctrl.run);
router.get ('/:staffId',     authenticate, authorize('admin'), ctrl.byStaff);
router.get ('/:id/payslip',  authenticate, authorize('admin'), ctrl.payslip);
module.exports = router;
