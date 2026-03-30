# EduCore SMS — School Management System

A full-featured, multi-role School Management System built for primary education (KG1–Primary 5). Supports SaaS multi-school deployment.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (optional)

---

### Option A — Docker (Recommended)

```bash
# Clone / unzip project
cd educore

# Start everything
docker-compose up -d

# Run DB migrations + seed
docker-compose exec api npx prisma migrate dev --name init
docker-compose exec api node prisma/seed.js
```

Visit: http://localhost:3000

---

### Option B — Manual

#### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials

npm install
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

API runs at: http://localhost:5000

#### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at: http://localhost:3000

---

## 🔑 Demo Login Credentials

| Role         | Email                    | Password     |
|--------------|--------------------------|--------------|
| Admin        | admin@educore.ng         | Admin@123    |
| Head Teacher | head@educore.ng          | Head@123     |
| Teacher      | teacher1@educore.ng      | Teacher@123  |
| Parent       | parent1@educore.ng       | Parent@123   |

---

## 📁 Project Structure

```
educore/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Full database schema
│   │   └── seed.js                # Demo data seeder
│   ├── src/
│   │   ├── app.js                 # Express + Socket.io entry
│   │   ├── routes.js              # All module routes
│   │   ├── config/db.js           # Prisma client
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT authenticate/authorize
│   │   │   ├── errorHandler.js    # Global error handler
│   │   │   └── rateLimiter.js     # Rate limiting
│   │   ├── modules/
│   │   │   ├── auth/              # Login, logout, refresh, me
│   │   │   ├── students/          # Enrollment, CRUD
│   │   │   ├── classes/           # Class & subject management
│   │   │   ├── attendance/        # Daily marking, reports
│   │   │   ├── assignments/       # Create, submit, grade
│   │   │   ├── results/           # Scores, positions, report cards
│   │   │   ├── finance/           # Fees, payments, expenses
│   │   │   ├── staff/             # Staff CRUD
│   │   │   ├── payroll/           # Monthly payroll processing
│   │   │   ├── messages/          # Internal messaging
│   │   │   ├── announcements/     # School-wide notices
│   │   │   ├── calendar/          # Events, holidays
│   │   │   ├── documents/         # File management
│   │   │   ├── staff-meetings/    # Meeting logs
│   │   │   └── dashboard/         # Role-based analytics
│   │   └── utils/
│   │       ├── generators.js      # ID generators, grade logic
│   │       └── apiResponse.js     # Standardised responses
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js          # Axios + auto-refresh interceptor
│   │   │   └── endpoints.js       # All API call functions
│   │   ├── store/authStore.js     # Zustand auth state
│   │   ├── components/
│   │   │   ├── layout/            # Sidebar, Topbar, Layout
│   │   │   └── ui/                # StatCard, Modal, Badge, Avatar...
│   │   ├── pages/
│   │   │   ├── auth/              # Login, Profile
│   │   │   ├── dashboard/         # Role-aware dashboard
│   │   │   ├── students/          # List, Detail, Enroll
│   │   │   ├── attendance/        # Mark & view attendance
│   │   │   ├── grades/            # Score entry, Report cards
│   │   │   ├── assignments/       # Create & manage assignments
│   │   │   ├── finance/           # Payments, fees, outstanding
│   │   │   ├── staff/             # Staff list, payroll
│   │   │   ├── messages/          # Inbox & thread view
│   │   │   ├── calendar/          # Monthly calendar
│   │   │   ├── documents/         # File management
│   │   │   └── meetings/          # Staff meeting logs
│   │   ├── App.jsx                # Router
│   │   └── main.jsx               # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🏫 Modules

| Module              | Description |
|---------------------|-------------|
| Authentication      | JWT login, refresh tokens, role-based access |
| Student Enrollment  | Bio data, parent linking, auto ID generation |
| Class Management    | KG1–Primary 5, subjects, teacher assignments |
| Attendance          | Daily marking (P/A/L), reports, term summary |
| Assignments         | Create, submit, grade with feedback |
| Teaching Log        | Topic coverage tracking per class/subject |
| Grading & Results   | CA scores, exam, auto-grade, class positions |
| Report Cards        | Per-term cards, PDF export, parent publishing |
| Finance             | Fee payments, receipts, outstanding balances |
| Staff & Payroll     | Staff profiles, monthly payroll processing |
| Internal Messaging  | Thread-based messaging between all roles |
| Announcements       | Role-targeted school-wide notices |
| School Calendar     | Events, exams, holidays with monthly view |
| Document Management | Upload, categorise, link to students/staff |
| Staff Meetings      | Log agendas, minutes, attendance |
| Dashboards          | Role-specific analytics for all 6 roles |

---

## 👥 User Roles

| Role          | Key Permissions |
|---------------|-----------------|
| Admin         | Full system access |
| Head Teacher  | Academic oversight, approve reports |
| Teacher       | Attendance, assignments, scores |
| Class Teacher | Manage own class, report cards |
| Student       | View results, assignments, attendance |
| Parent        | View child's performance and fees |

---

## 🔧 Environment Variables

See `backend/.env.example` for all required variables.

Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection
- `JWT_SECRET` — Must be 32+ characters
- `AWS_S3_BUCKET` — For file uploads (optional in dev)
- `SENDGRID_API_KEY` — For email notifications (optional)

---

## 📡 API Base URL

```
http://localhost:5000/v1
```

Health check: `GET /health`

All protected routes require:
```
Authorization: Bearer <access_token>
```

---

## 🗄️ Database

- **ORM**: Prisma
- **Database**: PostgreSQL 16
- **Models**: 20 tables across core, academic, finance, and communication domains

```bash
# View DB in Prisma Studio
cd backend
npx prisma studio
```

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

---

## 📦 Production Deployment

1. Set all env vars (especially JWT secrets, DB URL, S3)
2. Run `npx prisma migrate deploy` on production DB
3. Build frontend: `npm run build`
4. Deploy with Docker or your preferred cloud provider

See technical documentation for full production architecture.

---

## 🛠️ Tech Stack

**Backend**: Node.js · Express · PostgreSQL · Prisma · Redis · Socket.io · JWT

**Frontend**: React 18 · Vite · Tailwind CSS · TanStack Query · Zustand · Recharts

**Infrastructure**: Docker · Nginx · AWS S3 · SendGrid
