// src/modules/auth/auth.routes.js
const router = require('express').Router();
const { authenticate } = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');
const ctrl = require('./auth.controller');

router.post('/login',           authLimiter, ctrl.login);
router.post('/logout',          authenticate, ctrl.logout);
router.post('/refresh',         ctrl.refresh);
router.post('/forgot-password', authLimiter, ctrl.forgotPassword);
router.post('/reset-password',  ctrl.resetPassword);
router.get ('/me',              authenticate, ctrl.me);
router.put ('/me',              authenticate, ctrl.updateMe);
router.put ('/me/password',     authenticate, ctrl.changePassword);

module.exports = router;
