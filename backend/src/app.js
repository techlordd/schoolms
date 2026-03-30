// src/app.js
require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const bcrypt  = require('bcryptjs');
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

async function ensureBootstrapAdmin() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('BOOTSTRAP_ADMIN_EMAIL or BOOTSTRAP_ADMIN_PASSWORD not set, skipping bootstrap');
    return;
  }

  try {
    console.log(`Bootstrap: attempting to ensure admin user ${email}`);

    const school = await prisma.school.upsert({
      where: { code: 'ECS' },
      update: {},
      create: {
        name: 'EduCore Academy',
        code: 'ECS',
        address: '12 Learning Lane, Lagos, Nigeria',
        phone: '+234-801-234-5678',
        email: 'info@educoreacademy.ng',
        currentTerm: 2,
        currentYear: '2024/2025',
      },
    });
    console.log(`Bootstrap: school ensured (${school.id})`);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash: bcrypt.hashSync(password, 10),
        isActive: true,
      },
      create: {
        schoolId: school.id,
        email,
        passwordHash: bcrypt.hashSync(password, 10),
        role: 'admin',
        firstName: process.env.BOOTSTRAP_ADMIN_FIRST_NAME || 'Amara',
        lastName: process.env.BOOTSTRAP_ADMIN_LAST_NAME || 'Osei',
        phone: process.env.BOOTSTRAP_ADMIN_PHONE || '+234-801-000-0001',
      },
    });
    console.log(`✓ Bootstrap: admin user ensured (${user.id})`);
  } catch (error) {
    console.error(`✗ Bootstrap failed: ${error.message}`);
    throw error;
  }
}

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
app.get('/debug/admin-user', async (_req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@educore.ng' },
      select: { id: true, email: true, role: true, isActive: true, firstName: true, lastName: true },
    });
    res.json({ found: !!user, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
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

  if (process.env.BOOTSTRAP_ADMIN_EMAIL && process.env.BOOTSTRAP_ADMIN_PASSWORD) {
    console.log('BOOTSTRAP_ADMIN_* detected, ensuring admin user before startup...');
    await ensureBootstrapAdmin();
  } else {
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL ? '(set)' : '(not set)';
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD ? '(set)' : '(not set)';
    console.log(`Bootstrap skipped: BOOTSTRAP_ADMIN_EMAIL=${email}, BOOTSTRAP_ADMIN_PASSWORD=${password}`);
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
