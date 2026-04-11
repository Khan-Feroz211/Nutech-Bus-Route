# NUTECH BusTrack - Next Work TODO Guide

Use this checklist in your next session.

## 1. Email Delivery Finalization (High Priority)
- [x] Create `.env.local` with SMTP values:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `SMTP_FROM`
- [x] Restart app after env changes.
- [x] Test registration OTP email delivery.
- [x] Test forgot-password email delivery.
- [ ] Confirm recipient inbox + spam/junk behavior (deferred: complete after custom SMTP is configured).

## 2. Android Branding (NUTECH Identity)
- [x] Create web favicon logo with intersecting `NT` monogram.
- [ ] Replace default Android launcher icons with NUTECH icon set.
- [ ] Replace splash screen assets in Android resources.
- [ ] Verify icon quality on mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi.
- [ ] Confirm app name and package identity in Android project.

## 3. Android Release Signing (Play Store Ready)
- [ ] Create release keystore.
- [ ] Configure signing config in Gradle.
- [ ] Keep keystore and passwords outside git.
- [ ] Build AAB (`bundleRelease`).
- [ ] Validate generated AAB in Android Studio / Play Console checks.

## 4. Mobile Runtime Configuration
- [ ] Set `CAP_SERVER_URL` to production domain.
- [ ] Run `npm run mobile:cap:sync`.
- [ ] Open Android Studio project and run on physical device (deferred for now: pending full Android toolchain setup).
- [ ] Verify auth, OTP, notifications, and profile navigation on mobile (deferred until Android runtime setup is resumed).

## 5. Product Readiness Checks
- [ ] Remove/confirm any demo-only UI text is not exposed.
- [ ] Verify OTP rate limits and retry messaging.
- [ ] Verify notification actions: mark read, delete, clear all.
- [ ] Confirm role-based routes behave correctly (student/driver/admin).

## 6. Deployment & Security Hardening
- [ ] Ensure production secrets are set (`NEXTAUTH_SECRET`, SMTP creds, DB URL).
- [ ] Confirm HTTPS production URL in auth config.
- [ ] Run final build and smoke tests before release.
- [ ] Prepare rollback plan and backup strategy.

## 7. Suggested Next Session Order
1. SMTP setup and email verification tests
2. Android icon + splash branding
3. Android signing and AAB generation
4. Full QA pass on web + Android
5. Release candidate build

## Helpful Commands
```bash
npm run build
npm run mobile:cap:sync
npm run mobile:android:open
```

```powershell
cd android
.\gradlew bundleRelease
```
