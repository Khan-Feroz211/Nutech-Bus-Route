# NUTECH BusTrack: Android Transition & Skills Report

## 1. What New Work Was Completed

### A) Android Shift (Web-to-Android)
1. Added Capacitor integration in the existing Next.js repository.
2. Generated Android native project scaffolding under `android/`.
3. Added mobile workflow scripts to `package.json`:
- `mobile:cap:add:android`
- `mobile:cap:sync`
- `mobile:cap:copy`
- `mobile:android:open`
4. Added Android setup/build guide in `ANDROID_SETUP.md`.
5. Added `capacitor.config.ts` for hosted-url mode.
6. Added `mobile-web/index.html` shell required for Capacitor sync.

### B) Security and Reliability Enhancements
1. OTP email verification flow for new accounts.
2. Password reset security with token hashing and expiry.
3. Login/OTP/reset/registration rate limiting.
4. Explicit SMTP readiness checks to avoid silent email failures.

### C) Product UX Hardening
1. Notification actions: mark as read, delete, clear all.
2. Navbar/profile interaction improvements.
3. Visual normalization for cleaner launch-ready UI.

## 2. Languages / Technologies You Can Add to README Profile

### Primary Languages
1. TypeScript
2. SQL (via Prisma migrations)
3. Java/Kotlin ecosystem exposure through Android Gradle project scaffolding

### Backend / Platform Stack
1. Node.js
2. Next.js App Router + API routes
3. NextAuth (credentials auth)
4. Prisma ORM
5. SQLite / LibSQL adapter
6. Socket.IO (real-time updates)
7. Nodemailer (transactional email)

### Mobile / Android Stack
1. Capacitor
2. Android Gradle build system
3. Android Studio workflow
4. AAB/APK packaging pipeline

## 3. Exact Android Build Commands (Production Path)

1. Set hosted app URL (PowerShell):
```powershell
$env:CAP_SERVER_URL = "https://your-production-domain.com"
```

2. Sync Capacitor Android project:
```bash
npm run mobile:cap:sync
```

3. Open in Android Studio:
```bash
npm run mobile:android:open
```

4. Build Play Store package (AAB):
```powershell
cd android
.\gradlew bundleRelease
```

AAB output:
`android/app/build/outputs/bundle/release/app-release.aab`

## 4. Why Recipient Email Was Not Sending

Root cause found:
1. SMTP variables were not set in runtime environment:
- `SMTP_HOST` empty
- `SMTP_USER` empty
- `SMTP_PASS` not set
- `SMTP_FROM` not set

Result:
- Mail transport cannot initialize, so OTP/reset emails cannot be delivered.

## 5. Required SMTP Setup Checklist

1. Add in `.env.local`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_account@gmail.com
SMTP_PASS=your_google_app_password
SMTP_FROM="NUTECH BusTrack <your_account@gmail.com>"
```

2. If using Gmail, enable 2FA and generate an App Password.
3. Restart dev server after env changes.
4. Re-test `/register` and `/forgot-password` flows.

## 6. Recommended Learning Channels (Android + Modern Mobile)

### Official / Must-follow
1. Android Developers (official docs + codelabs)
- https://developer.android.com
2. Kotlinlang official docs
- https://kotlinlang.org/docs/home.html
3. Capacitor official docs
- https://capacitorjs.com/docs

### YouTube / Practical
1. Philipp Lackner (Kotlin, Jetpack Compose, architecture)
2. Android Developers channel (official updates)
3. Coding in Flow (Android basics to intermediate)
4. Traversy Media / Fireship (fast ecosystem updates)

### Newsletters / Trend Tracking
1. Android Weekly
2. Kotlin Weekly
3. InfoQ Mobile

## 7. Suggested README Profile Lines

1. "Built a secure multi-role transport platform using TypeScript, Next.js APIs, Prisma, and Socket.IO with OTP-based account verification."
2. "Extended the web app to Android using Capacitor, including Gradle-based AAB build pipeline for Play Store delivery."
3. "Implemented production-style security: bcrypt hashing, email verification OTP, tokenized reset flow, and layered rate limiting."

## 8. Next Step (Requested by Founder)

After SMTP is fully configured and validated, proceed with:
1. Custom NUTECH app icon set
2. NUTECH splash branding
3. Android signing configuration (keystore)
4. Release channel configuration for Play Store
