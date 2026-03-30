// src/modules/dashboard/dashboard.routes.js
const router = require('express').Router();
const { authenticate } = require('../../middleware/auth');
const ctrl = require('./dashboard.controller');
router.get('/admin',       authenticate, ctrl.admin);
router.get('/teacher',     authenticate, ctrl.teacher);
router.get('/student',     authenticate, ctrl.student);
router.get('/parent',      authenticate, ctrl.parent);
module.exports = router;
