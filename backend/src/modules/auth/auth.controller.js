// src/modules/auth/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const prisma = require('../../config/db');
const { ok } = require('../../utils/apiResponse');
const { AppError } = require('../../middleware/errorHandler');

const signAccess  = (payload) => jwt.sign(payload, process.env.JWT_SECRET,  { expiresIn: process.env.JWT_EXPIRES_IN  || '15m' });
const signRefresh = (payload) => jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

const tokenPayload = (user) => ({
  sub: user.id, schoolId: user.schoolId, role: user.role,
  firstName: user.firstName, lastName: user.lastName,
});

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw AppError('Email and password required');

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.isActive) throw AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw AppError('Invalid credentials', 401);

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  const payload = tokenPayload(user);
  const accessToken  = signAccess(payload);
  const refreshToken = signRefresh({ sub: user.id });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  ok(res, {
    accessToken,
    user: {
      id: user.id, email: user.email, role: user.role,
      firstName: user.firstName, lastName: user.lastName,
      schoolId: user.schoolId, avatarUrl: user.avatarUrl,
    },
  }, 'Login successful');
};

exports.logout = async (req, res) => {
  res.clearCookie('refreshToken');
  ok(res, null, 'Logged out');
};

exports.refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw AppError('No refresh token', 401);

  let payload;
  try { payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET); }
  catch { throw AppError('Invalid refresh token', 401); }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) throw AppError('User not found', 401);

  const accessToken = signAccess(tokenPayload(user));
  ok(res, { accessToken });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  // In production: generate reset token, store in Redis, send email
  // For now, we just acknowledge
  ok(res, null, 'If that email exists, a reset link has been sent.');
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) throw AppError('Token and password required');
  // In production: verify Redis token, update password
  ok(res, null, 'Password reset successful');
};

exports.me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.sub },
    select: { id:true, email:true, role:true, firstName:true, lastName:true,
               phone:true, avatarUrl:true, schoolId:true, lastLogin:true,
               school: { select: { name:true, code:true, logoUrl:true, currentTerm:true, currentYear:true } } },
  });
  if (!user) throw AppError('User not found', 404);
  ok(res, user);
};

exports.updateMe = async (req, res) => {
  const { firstName, lastName, phone, avatarUrl } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.sub },
    data: { firstName, lastName, phone, avatarUrl },
    select: { id:true, email:true, role:true, firstName:true, lastName:true, phone:true, avatarUrl:true },
  });
  ok(res, user, 'Profile updated');
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw AppError('Both passwords required');

  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw AppError('Current password incorrect');

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  ok(res, null, 'Password changed successfully');
};
