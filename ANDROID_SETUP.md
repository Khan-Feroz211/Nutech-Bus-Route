# Android Setup Guide (Capacitor)

This repo is now configured with Capacitor and Android scaffolding.

## What was added
1. Capacitor config: `capacitor.config.ts`
2. Android native project: `android/`
3. Placeholder mobile web shell: `mobile-web/index.html`
3. npm scripts in `package.json`:
- `mobile:cap:add:android`
- `mobile:cap:sync`
- `mobile:cap:copy`
- `mobile:android:open`

## One-time prerequisites
1. Install Android Studio (latest stable)
2. Install Android SDK + Build Tools from Android Studio SDK Manager
3. Install Java 17 (recommended for recent Android Gradle plugin)
4. Set environment variables (Windows):
- `ANDROID_HOME` (or `ANDROID_SDK_ROOT`) to your SDK path
- Add `%ANDROID_HOME%\\platform-tools` to PATH

## Recommended runtime mode for this Next.js app
This app uses Next.js server features. For mobile packaging, use a hosted web URL inside Capacitor WebView.

Set URL before sync/build (PowerShell):
```powershell
$env:CAP_SERVER_URL = "https://your-production-domain.com"
```

## Development workflow
1. Build your web app deployment first (Vercel or other host)
2. Set `CAP_SERVER_URL`
3. Sync native project:
```bash
npm run mobile:cap:sync
```
4. Open Android Studio project:
```bash
npm run mobile:android:open
```

## Exact command to create Play Store package (AAB)
Run from repo root:
```powershell
cd android
.\gradlew bundleRelease
```

AAB output path:
`android\app\build\outputs\bundle\release\app-release.aab`

## Optional APK command (local testing)
```powershell
cd android
.\gradlew assembleDebug
```

APK output path:
`android\app\build\outputs\apk\debug\app-debug.apk`

## Notes
1. `mobile-web/index.html` is a required placeholder for Capacitor sync and does not affect hosted URL mode.
2. For production app behavior, set `CAP_SERVER_URL` to your deployed web URL before `mobile:cap:sync`.
3. For offline-first/native-heavy app later, consider a separate React Native/Flutter client connected to this backend.
