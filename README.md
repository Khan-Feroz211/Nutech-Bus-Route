# NUTECH BusTrack 🚌

Real-time bus tracking SaaS platform for **National University of Technology (NUTECH)**, Islamabad, Pakistan.

## Features

- 🗺️ **Live Tracking** – Google Maps with animated bus marker (GPS simulation built-in)
- 👤 **Multi-role Auth** – Student, Driver, and Admin portals (NextAuth.js v5)
- 🔐 **Secure Student Auth** – Database-backed signup/login with bcrypt-hashed passwords
- 📧 **Password Recovery** – Email reset links with token expiry and rate limiting
- 📅 **Schedule** – Morning/evening timetables for 4 routes
- 🔔 **Notifications** – Arrival alerts, delay alerts, admin announcements
- 📱 **PWA** – Install as mobile app, offline support via Service Worker
- 🛡️ **Admin Dashboard** – Fleet overview, route/student management
- 🚗 **Driver Portal** – Start/end trips, browser Geolocation API
- 🔄 **Real-time** – Socket.io server with GPS simulation

## Routes

| Route | Area | Departure (Morning) |
|-------|------|---------------------|
| Route A | Rawalpindi Saddar | 7:30 AM |
| Route B | G-11 / G-10 | 7:45 AM |
| Route C | Bahria Town | 7:15 AM |
| Route D | F-10 / F-11 | 7:30 AM |

## Tech Stack

- **Next.js 14** (App Router) · TypeScript · Tailwind CSS
- **NextAuth.js v5** (JWT)
- **Socket.io** (real-time GPS)
- **Google Maps JavaScript API** (graceful fallback if no key)

## Quick Start

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Initialize database
npm run prisma:generate
npm run prisma:push

# Run (two terminals)
npm run dev          # Next.js on :3000
npm run server:dev   # Socket server on :3001
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
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=   # Optional – fallback UI if blank
NEXTAUTH_SECRET=                    # Min 32 chars
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
DATABASE_URL=file:./dev.db
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

## Build

```bash
npm run build          # Next.js production build
cd server && npm run build  # Socket server build
```

## Project Structure

```
src/
├── app/               # Next.js App Router (pages + API routes)
│   ├── (auth)/        # Login, Register
│   ├── (student)/     # Dashboard, Tracking, Schedule, Notifications, Profile, Report
│   ├── (driver)/      # Driver trip portal
│   ├── (admin)/       # Admin fleet management
│   └── api/           # REST API endpoints
├── components/        # UI, Maps, Student, Driver, Admin, Shared
├── hooks/             # useBusLocation, useNotifications
├── lib/               # auth, db (mock data), socket, utils
└── types/             # TypeScript types

server/
└── src/
    ├── socket/        # GPS handlers + GPS simulation
    ├── routes/        # Express routes
    ├── services/      # GPS, ETA, Notification services
    └── middleware/    # JWT, role checking
```

© 2024 NUTECH University, Islamabad, Pakistan
