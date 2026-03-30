// src/middleware/errorHandler.js
const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  if (err.code === 'P2002') // Prisma unique violation
    return res.status(409).json({ success: false, message: 'Record already exists', field: err.meta?.target });

  if (err.code === 'P2025') // Prisma record not found
    return res.status(404).json({ success: false, message: 'Record not found' });

  if (err.name === 'ZodError')
    return res.status(422).json({ success: false, message: 'Validation error', errors: err.errors });

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const AppError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

module.exports = { errorHandler, AppError };
