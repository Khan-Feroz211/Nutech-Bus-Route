# NUTECH BusTrack 🚌

![Status](https://img.shields.io/badge/Status-Active-green)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![License](https://img.shields.io/badge/License-Private-red)

Real-time bus tracking SaaS platform for **National University of Technology (NUTECH)**, Islamabad, Pakistan.

---

## 📊 Quick Stats

| Metric | Value | Status |
|--------|-------|--------|
| **Routes** | 4 Active Routes | ✅ Operational |
| **Users** | 3 Role Types | ✅ Multi-portal |
| **Real-time** | Socket.io GPS | ✅ Live Tracking |
| **Mobile** | Capacitor PWA | ✅ Android Ready |
| **Auth** | NextAuth v5 + JWT | ✅ Secure |
| **Database** | SQLite/LibSQL | ✅ Production Ready |

## Features

### Core Features
- 🗺️ **Live Tracking** – Google Maps with animated bus marker (GPS simulation built-in)
- 👤 **Multi-role Auth** – Student, Driver, and Admin portals (NextAuth.js v5)
- 🔐 **Secure Student Auth** – Database-backed signup/login with bcrypt-hashed passwords
- 📧 **Password Recovery** – Email reset links with token expiry and rate limiting
- 📅 **Schedule** – Morning/evening timetables for 4 routes
- 🔔 **Notifications** – Arrival alerts, delay alerts, admin announcements
- 📱 **PWA** – Install as mobile app, offline support via Service Worker

### Admin Features
- 🛡️ **Admin Dashboard** – Fleet overview, route/student management
- 📊 **Analytics** – Usage statistics, route performance
- 🚌 **Bus Management** – Add/edit/remove buses, assign drivers
- 🛣️ **Route Management** – Create routes with stops and schedules
- 📋 **Bus Pass Applications** – Approve/reject student bus pass requests
- 📝 **Reports** – View and manage student reports

### Student Features
- 🚌 **Real-time Bus Tracking** – Live location on map with ETA
- 📅 **Schedule View** – View bus timings for assigned route
- 🔔 **Notifications** – Delay alerts, arrival notifications
- 🎫 **Bus Pass** – Apply for bus pass, track application status
- 📍 **Report Issues** – Report bus/driver/route problems

### Driver Features
- 🚗 **Driver Portal** – Start/end trips, browser Geolocation API
- 📍 **Location Sharing** – Share real-time GPS location
- 📋 **Trip Management** – Manage daily trips

### Technical Features
- 🔄 **Real-time** – Socket.io server with GPS simulation
- 🧪 **Testing Infrastructure** – Vitest with React Testing Library
- ✅ **Input Validation** – Zod schemas for all API routes
- ⚡ **Rate Limiting** – Global and auth-specific rate limits
- 📝 **Structured Logging** – Pino logger with pretty printing
- 🐛 **Error Monitoring** – Sentry integration ready
- 🗄️ **Database Indexes** – Optimized queries with proper indexes
- 🔌 **WebSocket Auth** – JWT authentication for Socket.io
- 🏥 **Health Checks** – Database and socket status monitoring
- 🆔 **Request Tracing** – Request ID middleware for debugging
- 🌐 **API Versioning** – Versioned API endpoints (/api/v1)
- 🔀 **CORS & Compression** – Dynamic CORS origins, response compression

## Routes

| Route | Area | Departure (Morning) | Departure (Evening) |
|-------|------|---------------------|---------------------|
| Route A | Rawalpindi Saddar | 7:30 AM | 5:30 PM |
| Route B | G-11 / G-10 | 7:45 AM | 5:45 PM |
| Route C | Bahria Town | 7:15 AM | 5:15 PM |
| Route D | F-10 / F-11 | 7:30 AM | 5:30 PM |

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      NUTECH BusTrack System                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Student    │     │    Driver    │     │    Admin     │
│   Portal     │     │   Portal     │     │  Dashboard  │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Frontend (Port 3000)                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  App Router · TypeScript · Tailwind CSS · PWA Support  │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/WebSocket
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                   NextAuth.js v5 (Authentication)               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  JWT Tokens · Role-based Access · bcrypt Passwords      │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Socket.io Server (Port 3001)                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Real-time GPS · Location Updates · ETA Calculation      │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Database Layer                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  SQLite (Dev) / LibSQL (Prod) · Prisma ORM              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 📡 Data Flow: Real-time GPS Tracking

```
┌──────────┐
│  Driver  │
│  Device  │
└────┬─────┘
     │
     │ Geolocation API
     │ (GPS Coordinates)
     ▼
┌──────────────────┐
│  Socket.io       │
│  Client          │
└────┬─────────────┘
     │
     │ WebSocket Connection
     │ emit('location-update')
     ▼
┌──────────────────┐
│  Socket.io       │
│  Server (3001)   │
└────┬─────────────┘
     │
     │ Process & Validate
     │ Calculate ETA
     ▼
┌──────────────────┐
│  Broadcast to    │
│  Connected       │
│  Students        │
└────┬─────────────┘
     │
     │ emit('bus-location')
     ▼
┌──────────────────┐
│  Update Map      │
│  Marker in       │
│  Real-time       │
└──────────────────┘
```

## 🔐 Authentication Flow

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ Login Request
     ▼
┌──────────────────┐
│  NextAuth.js     │
│  /api/auth/signin│
└────┬─────────────┘
     │
     │ Validate Credentials
     │ (Database Lookup)
     ▼
┌──────────────────┐
│  bcrypt Compare  │
│  Password Hash   │
└────┬─────────────┘
     │
     │ Valid?
     ├─────────────┬────────────┐
     │ Yes         │ No         │
     ▼             ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Generate │  │ Return   │  │ Error    │
│ JWT Token│  │ Error    │  │ Message  │
└────┬─────┘  └──────────┘  └──────────┘
     │
     │ Set Session Cookie
     ▼
┌──────────────────┐
│  Redirect to     │
│  Role Dashboard  │
└──────────────────┘
```

## 🛠️ Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Frontend** | Next.js | 15.5 | React Framework (App Router) |
| **Frontend** | React | 18.3 | UI Library |
| **Frontend** | TypeScript | 5.5 | Type Safety |
| **Frontend** | Tailwind CSS | 3.4 | Styling |
| **Frontend** | Framer Motion | 11.x | Animations |
| **Frontend** | Lucide React | 0.400 | Icons |
| **Auth** | NextAuth.js | 5.0 (beta) | Authentication |
| **Auth** | bcryptjs | 3.0 | Password Hashing |
| **Real-time** | Socket.io | 4.7 | WebSocket Communication |
| **Real-time** | Socket.io Client | 4.7 | Client WebSocket |
| **Database** | Prisma | 7.7 | ORM |
| **Database** | LibSQL Client | 0.17 | Database Driver |
| **Database** | SQLite | - | Local Development DB |
| **Email** | Nodemailer | 7.0 | SMTP Email Sending |
| **Mobile** | Capacitor | 8.3 | PWA/Mobile App |
| **Testing** | Vitest | 2.x | Unit Testing |
| **Validation** | Zod | 3.x | Schema Validation |
| **Logging** | Pino | 9.x | Structured Logging |
| **Monitoring** | Sentry | 8.x | Error Tracking |
| **Utilities** | date-fns | 3.6 | Date Manipulation |
| **Utilities** | clsx | 2.1 | Conditional Classes |
| **Utilities** | tailwind-merge | 2.4 | Tailwind Class Merging |

## 📊 Tech Stack Comparison

| Feature | Implementation | Status |
|---------|---------------|--------|
| **Frontend Framework** | Next.js 15 App Router | ✅ Latest |
| **Authentication** | NextAuth.js v5 (beta) | ✅ Modern |
| **Real-time Updates** | Socket.io | ✅ Production Ready |
| **Database** | SQLite (dev) / LibSQL (prod) | ✅ Scalable |
| **Type Safety** | TypeScript | ✅ Full Coverage |
| **Styling** | Tailwind CSS | ✅ Utility-first |
| **Mobile Support** | Capacitor PWA | ✅ Cross-platform |
| **Email Service** | Nodemailer + SMTP | ✅ Configurable |

## 🌐 API Endpoints

### Authentication

```bash
# Login
POST /api/auth/signin
Content-Type: application/json

{
  "identifier": "NUTECH-2023-001",
  "password": "student123"
}
```

```bash
# Register Student
POST /api/auth/register
Content-Type: application/json

{
  "studentId": "NUTECH-2023-001",
  "name": "John Doe",
  "email": "john@nutech.edu.pk",
  "password": "securepassword123",
  "route": "A"
}
```

```bash
# Password Reset Request
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@nutech.edu.pk"
}
```

### Bus Tracking

```bash
# Get Bus Location (Socket.io Event)
socket.emit('get-bus-location', { route: 'A' })

# Response
socket.on('bus-location', (data) => {
  console.log(data);
  // { lat: 33.6844, lng: 73.0479, route: 'A', eta: 15 }
})
```

```bash
# Driver Update Location (Socket.io Event)
socket.emit('update-location', {
  route: 'A',
  lat: 33.6844,
  lng: 73.0479,
  speed: 45
})
```

### Admin Routes

```bash
# Get All Students
GET /api/admin/students
Authorization: Bearer <token>

# Get All Routes
GET /api/admin/routes
Authorization: Bearer <token>

# Create Route
POST /api/admin/routes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Route E",
  "area": "I-8 / I-9",
  "departureMorning": "08:00",
  "departureEvening": "06:00"
}
```

## 🔒 Security Features

| Feature | Implementation | Details |
|---------|---------------|---------|
| **Password Hashing** | bcryptjs | Salted hash with 10 rounds |
| **JWT Authentication** | NextAuth.js v5 | Secure token-based auth |
| **Role-based Access** | Middleware | Student/Driver/Admin roles |
| **Session Management** | NextAuth Sessions | Secure cookie-based sessions |
| **Password Reset** | Token-based | Expiring reset tokens (1 hour) |
| **Rate Limiting** | Email Reset | Prevents brute force attacks |
| **Environment Variables** | .env.local | Sensitive data protection |
| **SQL Injection Prevention** | Prisma ORM | Parameterized queries |
| **XSS Protection** | React Sanitization | Automatic escaping |
| **HTTPS Ready** | Next.js Config | Production SSL support |

## 📈 Monitoring & Logging

### Application Monitoring

```
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Stack                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Next.js     │  │  Socket.io   │  │  Database    │     │
│  │  Logs        │  │  Events      │  │  Queries     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            ▼                                │
│                  ┌──────────────────┐                       │
│                  │  Console/Stdout  │                       │
│                  │  + File Logging  │                       │
│                  └──────────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| **ERROR** | Critical failures | Database connection failed |
| **WARN** | Non-critical issues | Socket reconnection attempt |
| **INFO** | General operations | User login, route update |
| **DEBUG** | Detailed diagnostics | GPS coordinate updates |

### Health Check Endpoints

```bash
# Next.js Health Check
GET /api/health

# Socket.io Server Health Check
GET http://localhost:3001/health

# Response
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "connected",
    "socket": "active",
    "auth": "operational"
  }
}
```

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Production Environment                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Nginx /    │         │   Next.js    │         │  Socket.io   │
│   Reverse    │────────▶│   App        │────────▶│   Server     │
│   Proxy      │         │   (Port      │         │   (Port      │
│   (Port 80)  │         │   3000)      │         │   3001)      │
└──────────────┘         └──────┬───────┘         └──────┬───────┘
                                │                        │
                                │                        │
                                ▼                        ▼
                    ┌──────────────────┐      ┌──────────────────┐
                    │   LibSQL /       │      │   Shared        │
                    │   Turso DB       │      │   Memory Store  │
                    │   (Cloud)        │      │   (Sessions)    │
                    └──────────────────┘      └──────────────────┘
```

## 📱 Mobile App Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Capacitor PWA Flow                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  Next.js     │
│  Build       │
└──────┬───────┘
       │
       │ npx cap sync android
       ▼
┌──────────────┐
│  Android     │
│  Native      │
│  Wrapper     │
└──────┬───────┘
       │
       │ WebView Bridge
       ▼
┌──────────────┐
│  Installed   │
│  Mobile App  │
└──────────────┘
```

## 🧪 Testing

### Test Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts

# Run e2e tests
npm run test:e2e
```

### Test Coverage Goals

| Module | Target Coverage | Current | Status |
|--------|---------------|---------|--------|
| Authentication | 80% | TBD | 🟡 Pending |
| GPS Services | 75% | TBD | 🟡 Pending |
| API Routes | 70% | TBD | 🟡 Pending |
| Components | 60% | TBD | 🟡 Pending |
| Utils | 85% | TBD | 🟡 Pending |

## 📦 Project Structure

```
nutech-bustrack/
├── android/                    # Capacitor Android project
│   ├── app/
│   └── gradle/
├── public/                     # Static assets
│   ├── icons/
│   └── manifest.json
├── prisma/                     # Database schema & migrations
│   ├── schema.prisma
│   └── seed.ts
├── server/                     # Socket.io backend server
│   ├── src/
│   │   ├── index.ts           # Server entry point
│   │   ├── middleware/        # Auth & validation
│   │   ├── routes/           # Express routes
│   │   ├── services/         # Business logic
│   │   ├── socket/           # Socket.io handlers
│   │   └── types.ts          # Server types
│   ├── package.json
│   └── tsconfig.json
├── src/                       # Next.js frontend
│   ├── app/                  # App Router pages
│   │   ├── (auth)/          # Auth group (login, register)
│   │   ├── (student)/       # Student dashboard
│   │   ├── (driver)/        # Driver portal
│   │   ├── (admin)/         # Admin dashboard
│   │   └── api/             # API routes
│   ├── components/          # React components
│   │   ├── ui/             # Shared UI components
│   │   ├── maps/           # Map components
│   │   ├── student/        # Student-specific
│   │   ├── driver/         # Driver-specific
│   │   └── admin/          # Admin-specific
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities & helpers
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── socket.ts
│   │   └── utils.ts
│   └── types/              # TypeScript types
├── .env.example            # Environment template
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Initialize database
npx prisma generate
npx prisma db push

# Seed database (optional)
npm run db:seed

# Run (two terminals)
npm run dev          # Next.js on :3000
npm run server:dev   # Socket server on :3001
```

### Development Workflow

```
┌──────────────┐
│  Code Change │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  TypeScript  │
│  Check       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Lint Check  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Test        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Build       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Deploy      │
└──────────────┘
```

## 🎯 Development Commands

```bash
# Next.js Commands
npm run dev              # Start development server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Database Commands
npm run db:migrate       # Run database migrations
npm run db:reset         # Reset database and seed
npm run db:seed          # Seed database with test data

# Socket Server Commands
npm run server:dev       # Start Socket server in dev
npm run server:build     # Build Socket server

# Mobile Commands (Capacitor)
npm run mobile:cap:sync           # Sync assets to Android
npm run mobile:android:open       # Open Android Studio
npm run mobile:android:live       # Run live reload on device
npm run mobile:android:live:sync  # Sync and run live reload
```

## Demo Credentials

| Role | Identifier | Password |
|------|-----------|----------|
| 🎓 Student | `NUTECH-2023-001` | `student123` |
| 🚌 Driver | `DRV-001` | `1234` |
| ⚙️ Admin | `admin@nutech.edu.pk` | `admin123` |

## Environment Variables

See `.env.example` for all required variables.

```env
# Database (SQLite for local dev, use file: prefix for local, libsql:// for Turso/production)
DATABASE_URL=file:./prisma/dev.db

# Google Maps API Key (get from console.cloud.google.com)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here_min_32_chars

# SMTP (for password reset emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM="NUTECH BusTrack <no-reply@nutech.edu.pk>"

# Socket.io Server URL (the standalone Express server)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# JWT Secret for the Socket.io server
JWT_SECRET=your_jwt_secret_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔧 Configuration

### Google Maps Setup

```
┌─────────────────────────────────────────────────────────────┐
│              Google Maps API Configuration                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Go to console.cloud.google.com                           │
│  2. Create new project                                       │
│  3. Enable:                                                  │
│     - Maps JavaScript API                                    │
│     - Places API                                             │
│  4. Create API Key with restrictions:                        │
│     - HTTP referrers: your domain                            │
│     - IP addresses: server IPs                               │
│  5. Add to .env.local:                                       │
│     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### SMTP Email Setup

```
┌─────────────────────────────────────────────────────────────┐
│              SMTP Email Configuration                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Gmail Setup (Example):                                      │
│  1. Enable 2FA on your Google account                       │
│  2. Generate App Password:                                   │
│     - Account → Security → 2FA → App Passwords              │
│  3. Use App Password in SMTP_PASS                           │
│                                                             │
│  .env.local:                                                 │
│  SMTP_HOST=smtp.gmail.com                                    │
│  SMTP_PORT=587                                               │
│  SMTP_USER=your_email@gmail.com                              │
│  SMTP_PASS=your_app_password                                 │
│  SMTP_FROM="NUTECH BusTrack <no-reply@nutech.edu.pk>"       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Build & Deployment

```bash
# Production Build
npm run build          # Next.js production build
cd server && npm run build  # Socket server build

# Run in Production
npm run start          # Next.js on :3000
cd server && npm start # Socket server on :3001
```

### Deployment Checklist

| Task | Command | Status |
|------|---------|--------|
| **Environment Variables** | Set in production | ⬜ |
| **Database Migration** | `npx prisma migrate deploy` | ⬜ |
| **Build Frontend** | `npm run build` | ⬜ |
| **Build Server** | `cd server && npm run build` | ⬜ |
| **Configure Domain** | DNS + SSL | ⬜ |
| **Set up Reverse Proxy** | Nginx/Apache | ⬜ |
| **Configure Process Manager** | PM2/Systemd | ⬜ |
| **Enable HTTPS** | SSL Certificate | ⬜ |

## 🐛 Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **Socket connection failed** | Server not running | Run `npm run server:dev` in separate terminal |
| **Map not loading** | Missing API key | Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to .env.local |
| **Auth errors** | Invalid NEXTAUTH_SECRET | Generate new secret with `openssl rand -base64 32` |
| **Database locked** | SQLite file locked | Close all database connections, restart server |
| **Email not sending** | SMTP credentials wrong | Verify SMTP_USER and SMTP_PASS in .env.local |
| **Mobile app not syncing** | Capacitor not synced | Run `npm run mobile:cap:sync` |
| **GPS not updating** | Geolocation permission denied | Enable location in browser settings |

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Check Socket.io connections
# Open browser console and look for socket events

# Check database
npx prisma studio
```

## 🗺️ Roadmap

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Roadmap                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Completed:                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Multi-role authentication (Student/Driver/Admin)   │   │
│  │ • Real-time GPS tracking with Socket.io              │   │
│  │ • Google Maps integration                           │   │
│  │ • Password recovery with email                       │   │
│  │ • Mobile PWA with Capacitor                         │   │
│  │ • Testing infrastructure (Vitest)                   │   │
│  │ • Input validation (Zod)                            │   │
│  │ • Rate limiting                                     │   │
│  │ • Structured logging (Pino)                         │   │
│  │ • Error monitoring (Sentry)                         │   │
│  │ • Database indexes                                  │   │
│  │ • WebSocket JWT authentication                      │   │
│  │ • Health checks                                     │   │
│  │ • Request ID middleware                             │   │
│  │ • API versioning                                    │   │
│  │ • CORS & compression                                │   │
│  │ • Animated landing page                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🚧 In Progress:                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Push notifications (FCM)                          │   │
│  │ • Admin analytics dashboard                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📋 Planned:                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • iOS support (Capacitor iOS)                        │   │
│  │ • Offline map caching                                │   │
│  │ • Parent portal for tracking children                │   │
│  │ • Multi-language support (Urdu/English)             │   │
│  │ • Attendance tracking integration                   │   │
│  │ • Bus capacity management                           │   │
│  │ • Driver performance analytics                      │   │
│  │ • Route optimization algorithm                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🤝 Contributing

### Contribution Workflow

```
┌──────────────┐
│  Fork Repo   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Create      │
│  Branch      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Make        │
│  Changes     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Commit &    │
│  Push        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Pull        │
│  Request     │
└──────────────┘
```

### Guidelines

- Follow the existing code style (TypeScript, Prettier)
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is proprietary software for National University of Technology (NUTECH), Islamabad, Pakistan.

© 2024 NUTECH University, Islamabad, Pakistan

---

## 📞 Support & Contact

| Contact Type | Details |
|--------------|---------|
| **Issues** | Create an issue in the repository |
| **Email** | support@nutech.edu.pk |
| **Location** | NUTECH, Islamabad, Pakistan |

---

## 🔗 Related Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js v5](https://authjs.dev/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)

---

**Built with ❤️ for NUTECH University Students**
