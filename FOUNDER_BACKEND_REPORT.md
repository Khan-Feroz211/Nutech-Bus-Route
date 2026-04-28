# NUTECH BusTrack Backend Report

## Executive Summary
This project backend is built primarily with TypeScript on Node.js, using a hybrid architecture:
1. Next.js App Router API routes for web-facing backend endpoints
2. Express + Socket.IO server for real-time operations
3. Prisma ORM over SQLite (with LibSQL adapter support)

The backend now includes stronger launch-grade security controls such as OTP-based email verification, password hashing, tokenized reset flow, and layered rate limiting.

## Backend Languages and Core Runtime
1. TypeScript
- Primary backend language for all server logic
- Used in API handlers, auth logic, services, middleware, and database integration

2. SQL (via Prisma migrations)
- SQL migration scripts manage schema evolution
- Used for tables, indexes, and constraints

3. JavaScript ecosystem runtime
- Node.js runtime executes TypeScript-compiled backend services

## Backend Frameworks and Infrastructure Used
1. Next.js API Routes
- Path: src/app/api/*
- Handles authentication, registration, reset, notifications, routes, trips, reports, bus status

2. NextAuth (Credentials Provider)
- Role-based auth for student, driver, admin
- Session and token callbacks for secure access context

3. Express Server + Socket.IO
- Path: server/src/*
- Real-time bus tracking and event updates
- Middleware-driven auth/role checks

4. Prisma ORM + SQLite/LibSQL
- Schema-first data layer
- Migration-based database lifecycle
- Strongly typed DB access

## Security Work Implemented on Backend
1. Password security
- Bcrypt hashing (12 rounds)
- Password strength policy validation

2. Account recovery security
- Password reset via email link
- Token hash storage (SHA-256)
- Expiry enforcement and one-time-use token invalidation

3. OTP verification security
- First-time email verification via 6-digit OTP
- OTP expiry (5 minutes)
- OTP attempt limits with invalidation on abuse

4. Rate-limiting controls
- Registration rate limits
- Password-reset request limits
- OTP send/verify limits
- Login attempt limits wired into live auth path

5. Abuse and account-hardening controls
- Duplicate account checks (email and roll number)
- Verified-email gating before student login
- Input normalization and validation

## Backend Modules by Responsibility
1. Authentication and account management
- src/lib/auth.ts
- src/lib/accountService.ts
- src/app/api/auth/*

2. Notification backend
- src/app/api/notifications/route.ts
- src/hooks/useNotifications.ts (frontend bridge to backend actions)

3. Data and persistence
- prisma/schema.prisma
- prisma/migrations/*
- src/lib/prisma.ts

4. Real-time services
- server/src/socket/gpsHandler.ts
- server/src/services/*

## What This Means for Stakeholders
1. Technical maturity
- The backend is no longer MVP-only; it includes practical production safeguards.

2. Security posture
- Strong baseline against common attacks (credential stuffing, brute force, token abuse, account spam).

3. Launch readiness
- Suitable for pilot and investor/demo launch with clear architecture and security story.

## Suggested One-Line Founder Summary
"Our backend is TypeScript/Node.js with Next.js APIs, Express real-time services, Prisma-managed SQL database, and production-style security controls including OTP verification, bcrypt hashing, and layered rate limiting."
