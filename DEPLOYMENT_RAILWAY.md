# Railway Deployment Guide for NUTECH BusTrack

## Quick Deploy to Railway (via GitHub)

### Prerequisites
- GitHub account with this repo
- Railway account (https://railway.app)
- All environment variables ready

### Step 1: Push to GitHub
```bash
# From your local machine
git add .
git commit -m "feat: prepare for railway deployment"
git push origin main
```

### Step 2: Connect Railway to GitHub
1. Go to https://railway.app/dashboard
2. Click **New Project** → **Deploy from GitHub repo**
3. Select **Khan-Feroz211/Nutech-Bus-Route**
4. Railway will auto-detect Next.js and create a web service

### Step 3: Configure Environment Variables

In Railway dashboard, go to **Variables** tab and add:

#### Database & Auth
```
DATABASE_URL=libsql://your-db.turso.io?authToken=your_token
NEXTAUTH_URL=https://your-railway-domain.railway.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
```

#### API Keys
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.railway.app
JWT_SECRET=<generate with: openssl rand -base64 32>
```

#### Firebase (for notifications)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="your_private_key"
```

#### SMTP (for password reset emails)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="NUTECH BusTrack <your_email@nutech.edu.pk>"
SMTP_ALLOW_INSECURE_TLS=false
```

#### App URL
```
NEXT_PUBLIC_APP_URL=https://your-railway-domain.railway.app
```

### Step 4: Deploy Socket.io Server (Optional - for real-time features)

You can deploy the Socket.io server as a separate Railway service:

1. In Railway dashboard, click **New Service** → **GitHub Repo**
2. Point to the same repo
3. Configure build to use `cd server && npm install && npm run build && npm start`
4. Add environment variables:
   - `JWT_SECRET` (same as main app)
   - `ALLOWED_ORIGINS` = `https://your-railway-domain.railway.app`
   - `PORT` = 3001 (Railway will assign a different port)

### Step 5: Update Main App Environment

Update `NEXT_PUBLIC_SOCKET_URL` to point to your Socket.io service URL from Railway.

### Step 6: Monitor Deployments

- Railway auto-deploys on every push to `main`
- View logs in Railway dashboard
- Check health at `https://your-domain/health`

---

## Database Setup

### Option A: Turso (Recommended for SQLite)

```bash
# Install Turso CLI
npm install -g @tursodatabase/cli

# Create database
turso db create nutech-bustrack

# Get URL and token
turso db show nutech-bustrack

# Set in Railway: DATABASE_URL=libsql://...?authToken=...
```

Then in Railway, run migrations:
- Connect to your Railway service
- Run: `npx prisma migrate deploy`

### Option B: PostgreSQL on Railway

1. In Railway, add **PostgreSQL** service
2. Copy DATABASE_URL from Postgres service variables
3. Set in your main app's variables
4. Run migrations in deployment logs

---

## Post-Deployment Checklist

- [ ] Domain is working (`https://your-domain.railway.app`)
- [ ] Health check passes (`GET /health`)
- [ ] Database migrations ran successfully
- [ ] Firebase notifications are configured
- [ ] Email (SMTP) is working - test with password reset
- [ ] Socket.io server is connected (real-time GPS tracking)
- [ ] Google Maps loads correctly
- [ ] Authentication works (login/signup)

---

## Troubleshooting

### Build Fails
- Check Railway logs for error message
- Ensure all dependencies are in `package.json`
- Verify Node.js version (project uses Node 20+)

### Database Connection Issues
- Test `DATABASE_URL` locally: `npx prisma db push`
- Check Turso/PostgreSQL is running
- Verify auth token is correct

### Deployment Won't Start
- Check `npm start` works locally: `npm run build && npm start`
- Verify PORT env var (Railway assigns automatically)
- Check logs for missing dependencies

### Real-time Features Not Working
- Verify `NEXT_PUBLIC_SOCKET_URL` points to Socket.io server
- Check Socket.io server is deployed and running
- Verify `ALLOWED_ORIGINS` includes your main domain
- Check browser console for WebSocket errors

---

## CI/CD with GitHub Actions (Optional)

Create `.github/workflows/deploy.yml` to auto-test before Railway deploys:

```yaml
name: Test & Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run lint
      - run: npm run test:run
      - run: npm run build
```

---

## Rollback Instructions

If deployment breaks:

1. Go to Railway dashboard
2. Click on your deployment
3. Click **Rollback** to previous working version
4. Or, revert commit and push to `main`

---

## Costs on Railway

- **Free tier**: First $5 credit/month (enough for hobby project)
- **After free tier**: Pay-as-you-go (~$0.50/month per service)
- **Database**: Turso free tier = 8GB storage, unlimited bandwidth

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: GitHub Issues
