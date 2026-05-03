# Pre-Deployment Checklist - NUTECH BusTrack

Complete this checklist before pushing to GitHub and deploying to Railway.

## ✅ Code Quality

- [x] Build succeeds locally (`npm run build`)
- [x] No TypeScript compilation errors
- [x] Server builds successfully (`cd server && npm run build`)
- [ ] Run linter: `npm run lint` (fix any issues)
- [ ] Run tests: `npm run test:run` (all tests pass)

## ✅ Configuration Files

- [x] `.env.example` exists with all required variables
- [x] `.env.local` configured for local development
- [x] `Procfile` created for Railway
- [x] `railway.json` created for Railway config
- [x] `server/Procfile` created for Socket.io server
- [x] `.dockerignore` created
- [x] `package.json` postbuild script added

## ✅ Environment Variables

Before deploying, you'll need to set these in Railway:

### Critical (App won't work without these)
- [ ] `DATABASE_URL` - Turso or PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - Your Railway domain (https://your-app.railway.app)
- [ ] `NEXTAUTH_SECRET` - Generate: `openssl rand -base64 32`
- [ ] `JWT_SECRET` - Generate: `openssl rand -base64 32`
- [ ] `NEXT_PUBLIC_SOCKET_URL` - Socket.io server URL

### Important (Features won't work without these)
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key
- [ ] `NEXT_PUBLIC_FIREBASE_*` - All Firebase config
- [ ] `FIREBASE_PROJECT_ID` - Firebase Admin
- [ ] `FIREBASE_CLIENT_EMAIL` - Firebase Admin
- [ ] `FIREBASE_PRIVATE_KEY` - Firebase Admin (with escaped newlines)

### Optional (Nice to have)
- [ ] `SMTP_*` - Email sending for password reset
- [ ] `NEXT_PUBLIC_APP_URL` - Custom app URL

## ✅ Database Preparation

- [ ] Create Turso or PostgreSQL database
- [ ] Get DATABASE_URL connection string
- [ ] Test connection locally: `npx prisma db push`
- [ ] Verify migrations will run on deployment

## ✅ GitHub Setup

- [ ] Repository is public on GitHub
- [ ] All sensitive files are in .gitignore:
  - `.env.local`
  - `dev.db`
  - Firebase service account keys
  - `node_modules`
- [ ] No secrets committed to repo (check `git log`)

## ✅ Firebase Setup

- [ ] Firebase project created (console.firebase.google.com)
- [ ] Service account key generated
- [ ] VAPID key created for FCM
- [ ] Cloud Messaging enabled
- [ ] All Firebase env vars added

## ✅ API Keys & Credentials

- [ ] Google Maps API key created and enabled for Maps JavaScript API
- [ ] Key restrictions set to your Railway domain
- [ ] Firebase credentials tested locally
- [ ] SMTP credentials (if using email)

## ✅ Pre-Push Verification

Run these commands before pushing:

```bash
# 1. Lint code
npm run lint

# 2. Run tests (optional)
npm run test:run

# 3. Build production bundle
npm run build

# 4. Check git status
git status

# 5. Review changes
git diff --cached

# 6. Verify no secrets in changes
git log --all -p -S "your_secret_key_here" | head -20
```

## ✅ GitHub Push

```bash
# Stage all changes
git add .

# Commit
git commit -m "feat: finalize deployment configuration for Railway"

# Push to main
git push origin main
```

## ✅ Railway Deployment Steps

1. [ ] Go to https://railway.app/dashboard
2. [ ] Click **New Project** → **Deploy from GitHub repo**
3. [ ] Select `Khan-Feroz211/Nutech-Bus-Route`
4. [ ] Railway auto-detects Next.js
5. [ ] Go to **Variables** tab
6. [ ] Add all environment variables from the "Environment Variables" section above
7. [ ] Click **Deploy**

### For Socket.io Server (Optional)

If you want real-time GPS tracking:

1. [ ] Create new Railway service
2. [ ] Select the same GitHub repo
3. [ ] Set custom build command: `cd server && npm install && npm run build && npm start`
4. [ ] Add `JWT_SECRET` and `ALLOWED_ORIGINS` variables
5. [ ] Copy the deployed URL
6. [ ] Update main app's `NEXT_PUBLIC_SOCKET_URL` variable

## ✅ Post-Deployment Verification

After Railway deploys:

- [ ] App is accessible at Railway domain
- [ ] `/health` endpoint returns `{"status":"ok"}`
- [ ] Login page loads without errors
- [ ] Can create account (test with temporary email)
- [ ] Email verification works (check SMTP)
- [ ] Password reset flow works
- [ ] Real-time features work (if Socket.io deployed)
- [ ] Google Maps loads correctly
- [ ] Notifications appear (if Firebase configured)
- [ ] Admin dashboard loads
- [ ] No errors in Railway logs

## ✅ Troubleshooting Commands

If deployment fails, check:

```bash
# View Railway logs
# In Railway dashboard: Deployments → click build → View Logs

# Test locally
npm run build
npm start

# Check environment
echo $DATABASE_URL
echo $NEXTAUTH_URL

# Rebuild in Railway
# Dashboard → Redeploy button
```

## 🎯 Final Checklist

- [ ] `.env.local` has all required variables
- [ ] Build succeeds: `npm run build`
- [ ] No secrets in git: `git status`
- [ ] Changes committed: `git push origin main`
- [ ] Railway variables configured
- [ ] Deployment started
- [ ] Health endpoint working
- [ ] Login/signup works
- [ ] App is live!

---

## 📝 Notes

- **Database**: Turso offers free tier (8GB). Upgrade to paid if you need more.
- **Railway**: Free tier includes first $5 credit/month. Most hobby projects fit comfortably.
- **Socket.io Server**: Can be deployed separately on Railway or run on same dyno.
- **Rollback**: If something breaks, Railway lets you rollback to previous deployment.

---

**Ready to deploy?** ✅ Run these final commands:

```bash
npm run lint
npm run build
git add .
git commit -m "feat: finalize railway deployment"
git push origin main
```

Then head to Railway dashboard and watch it deploy! 🚀
