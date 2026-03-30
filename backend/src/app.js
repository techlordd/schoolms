// src/app.js
require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const http    = require('http');
const { Server } = require('socket.io');

const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter }  = require('./middleware/rateLimiter');
const routes           = require('./routes');
const prisma           = require('./config/db');
const { seedDatabase } = require('../prisma/seed');

const app    = express();
const server = http.createServer(app);

const normalizeOrigin = (value) => {
  if (!value) return '';
  const trimmed = value.trim().replace(/\/$/, '');
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.on('join_room', (userId) => socket.join(userId));
  socket.on('disconnect', () => {});
});

app.set('io', io);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', version: '1.0.0' }));
app.use('/v1', routes);

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function start() {
  if (process.env.RUN_SEED_ON_BOOT === 'true') {
    console.log('RUN_SEED_ON_BOOT=true, seeding database before startup...');
    await seedDatabase();
    console.log('Startup seed complete.');
  }

  server.listen(PORT, () => {
    console.log(`\n🚀 EduCore API running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   Health: http://localhost:${PORT}/health\n`);
  });
}

start().catch(async (error) => {
  console.error('Failed to start application', error);
  await prisma.$disconnect();
  process.exit(1);
});

module.exports = { app, server };
