// src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ success: false, message: msg });
  }
};

// Usage: authorize('admin', 'head_teacher')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  next();
};

// Ensure user belongs to the school in the request
const sameSchool = (req, res, next) => {
  const schoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;
  if (schoolId && req.user.schoolId !== schoolId && req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Cross-school access denied' });
  next();
};

module.exports = { authenticate, authorize, sameSchool };
