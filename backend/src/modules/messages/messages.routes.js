// src/modules/messages/messages.routes.js
const router = require('express').Router();
const { authenticate } = require('../../middleware/auth');
const ctrl = require('./messages.controller');
router.get ('/',        authenticate, ctrl.inbox);
router.post('/',        authenticate, ctrl.send);
router.get ('/:id',     authenticate, ctrl.thread);
router.put ('/:id/read',authenticate, ctrl.markRead);
router.delete('/:id',   authenticate, ctrl.remove);
module.exports = router;
