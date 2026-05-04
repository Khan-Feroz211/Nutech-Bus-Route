# NUTECH BusTrack — Deployment Guide

## Architecture

```
├── Next.js 15 frontend + API routes   → Vercel (recommended) or any Node.js host
├── Socket.io real-time server          → Railway / Render / fly.io
└── SQLite database (dev)               → upgrade to PostgreSQL/Turso for production
```

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- npm 10+

### Steps

```bash
# 1. Clone and install
git clone https://github.com/Khan-Feroz211/Nutech-Bus-Route.git
cd Nutech-Bus-Route
npm install

# 2. Copy environment file
cp .env.example .env.local
# Edit .env.local with your actual values (see Environment Variables section)

# 3. Set up and seed the database
sqlite3 prisma/dev.db < prisma/migrations/20260407155223_init/migration.sql
npm run db:seed

# 4. Start the real-time server (in a separate terminal)
cd server && npm install && npm run dev

# 5. Start the Next.js dev server
npm run dev
```

Open http://localhost:3000

**Demo credentials:**
| Role    | Identifier           | Password    |
|---------|----------------------|-------------|
| Student | NUTECH-2023-001      | student123  |
| Driver  | DRV-001              | 1234        |
| Admin   | admin@nutech.edu.pk  | admin123    |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable                        | Description                                      |
|---------------------------------|--------------------------------------------------|
| `DATABASE_URL`                  | SQLite: `file:./prisma/dev.db` or Turso URL      |
| `NEXTAUTH_URL`                  | Your app's public URL                            |
| `NEXTAUTH_SECRET`               | Random 32+ char secret (run `openssl rand -base64 32`) |
| `NEXT_PUBLIC_SOCKET_URL`        | URL of the Socket.io server                      |
| `JWT_SECRET`                    | Secret for Socket.io JWTs                        |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps key with Maps JS API enabled       |
| `SMTP_HOST`/`SMTP_PORT`/etc.    | SMTP credentials for email notifications (optional) |
| `SMTP_ALLOW_INSECURE_TLS`       | Optional TLS override for specific SMTP providers  |

---

## Production Deployment

### Option A: Vercel + Turso (Recommended)

1. **Database**: Create a free [Turso](https://turso.tech) database
   ```bash
   turso db create nutech-bustrack
   turso db show nutech-bustrack   # copy the URL and token
   ```
   Set `DATABASE_URL=libsql://your-db.turso.io?authToken=your_token`

2. **Socket.io Server**: Deploy to [Railway](https://railway.app) or [Render](https://render.com)
   ```bash
   cd server
   # Set environment: JWT_SECRET, ALLOWED_ORIGINS
   ```

3. **Next.js App**: Deploy to [Vercel](https://vercel.com)
  - Connect your GitHub repo
  - Add all environment variables from `.env.example` in the Vercel dashboard
  - For SMTP, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and optionally `SMTP_ALLOW_INSECURE_TLS`
  - If you use Gmail, generate a 16-character App Password after enabling 2FA and paste that into `SMTP_PASS`
  - Set `NEXT_PUBLIC_SOCKET_URL` to your Railway/Render socket server URL

### Option B: Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "file:/data/nutech.db"
      NEXTAUTH_URL: "http://your-domain.com"
      NEXTAUTH_SECRET: "your-secret"
      NEXT_PUBLIC_SOCKET_URL: "http://socket:3001"
    volumes:
      - db_data:/data

  socket:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      JWT_SECRET: "your-jwt-secret"
      ALLOWED_ORIGINS: "http://your-domain.com"

volumes:
  db_data:
```

```bash
docker-compose up -d
docker-compose exec app npx tsx prisma/seed.ts  # seed initial data
```

---

## Database Management

### Run migrations (apply schema changes)
```bash
npm run db:migrate
```

### Seed initial data
```bash
npm run db:seed
```

### Reset database (⚠️ deletes all data)
```bash
npm run db:reset
```

---

## Migrating to PostgreSQL

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```

2. Update `prisma.config.ts` with the PostgreSQL URL

3. Install the PostgreSQL adapter:
   ```bash
   npm install @prisma/adapter-pg pg
   npm install -D @types/pg
   ```

4. Update `src/lib/prisma.ts`:
   ```ts
   import { PrismaPg } from '@prisma/adapter-pg';
   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
   ```

5. Run migrations:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

---

## University IT Checklist

- [ ] Google Maps API key enabled for Maps JavaScript API
- [ ] NEXTAUTH_SECRET is a random 32+ character string (NOT the demo value)
- [ ] Database is backed up regularly (cron job for SQLite dump / Turso automatic backups)
- [ ] Socket.io server has CORS configured to only allow your domain
- [ ] SMTP credentials configured for email notifications
- [ ] HTTPS enabled (Vercel/Railway handle this automatically)
- [ ] Change all demo passwords after first deployment
