// src/modules/finance/finance.routes.js
const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./finance.controller');

router.get ('/dashboard',             authenticate, authorize('admin','head_teacher'), ctrl.dashboard);
router.get ('/payments',              authenticate, authorize('admin','head_teacher'), ctrl.listPayments);
router.post('/payments',              authenticate, authorize('admin'), ctrl.recordPayment);
router.get ('/payments/:studentId',   authenticate, ctrl.studentPayments);
router.get ('/outstanding',           authenticate, authorize('admin','head_teacher'), ctrl.outstanding);
router.get ('/receipts/:id/pdf',      authenticate, ctrl.receiptPdf);
router.get ('/fee-structures',        authenticate, ctrl.feeStructures);
router.post('/fee-structures',        authenticate, authorize('admin'), ctrl.createFeeStructure);
router.get ('/expenses',              authenticate, authorize('admin','head_teacher'), ctrl.listExpenses);
router.post('/expenses',              authenticate, authorize('admin'), ctrl.recordExpense);
router.get ('/report',                authenticate, authorize('admin','head_teacher'), ctrl.report);

module.exports = router;
