# Finly — Android Build Guide

Finly is a Capacitor-based Android app. The web layer (React + Vite) builds to `dist/`, which Capacitor copies into the native Android project under `android/app/src/main/assets/public/`.

## Prerequisites

- **Node.js 18+** and npm (already used for the web build)
- **Android Studio** (Hedgehog or newer) — download from https://developer.android.com/studio
- **Android SDK** with:
  - Platform 34+ (compileSdk)
  - Build-Tools 34+
  - Platform Tools
- **JDK 21** (bundled with recent Android Studio versions)

First-time setup: open Android Studio once so it installs the required SDK components.

## Project configuration

| Setting | Value |
|---|---|
| App name | `Finly` (`android/app/src/main/res/values/strings.xml`) |
| Package / applicationId | `com.finly.app` (`android/app/build.gradle`) |
| Version | `1.0` (versionCode `1`) |
| Web dir | `dist` (`capacitor.config.ts`) |
| App icon | Adaptive icon — vector drawable in `res/drawable/ic_launcher_foreground.xml` + `ic_launcher_background.xml` |
| Splash screen | Vector drawable in `res/drawable/splash.xml` (dark background + wallet logo) |
| Network | HTTPS-only to `supabase.co` (`res/xml/network_security_config.xml`) |

## Build the web assets and sync to Android

Every time you change web code, rebuild and sync before opening Android Studio:

```bash
npm run cap:sync
```

This runs `npm run build` and then `npx cap sync android`, which copies `dist/` into the Android project and updates native plugin references.

## Open the project in Android Studio

```bash
npm run cap:open
# or: npx cap open android
```

Android Studio opens with the `android/` project loaded. Wait for Gradle to finish syncing (status bar at the bottom).

## Build a debug APK

A debug APK is signed with the auto-generated debug keystore and is fine for testing on your own devices.

1. In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
2. When it finishes, click "locate" in the toast, or find the file at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

From the command line instead:

```bash
cd android
./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

## Build a release AAB (for Google Play)

An AAB (Android App Bundle) is the format Google Play requires for new submissions.

1. You need a release signing key. Generate one once (skip if you already have one):

```bash
keytool -genkey -v -keystore finly-release.keystore -alias finly -keyalg RSA -keysize 2048 -validity 10000
```

Keep this file and its passwords safe — losing it means you can't update the app on Google Play.

2. Add the keystore config to `android/app/build.gradle` inside `android { ... }`:

```gradle
signingConfigs {
    release {
        storeFile file('../../finly-release.keystore') // path relative to app/
        storePassword 'YOUR_STORE_PASSWORD'
        keyAlias 'finly'
        keyPassword 'YOUR_KEY_PASSWORD'
    }
}
```

And inside `buildTypes { release { ... } }` add:

```gradle
signingConfig signingConfigs.release
```

(For safety, store passwords in `~/.gradle/gradle.properties` or environment variables instead of committing them.)

3. In Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**, pick your keystore, select the `release` build variant, and build.

Or from the command line:

```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

## Build a release APK (for direct distribution)

If you want a signed APK to share outside Google Play:

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

## Run on a device or emulator

1. Enable **Developer Options → USB Debugging** on your Android device, or start an emulator from Android Studio's Device Manager.
2. In Android Studio, select the device from the dropdown and click **Run** (green play button).
3. Or from the CLI:

```bash
npx cap run android
```

## Offline behavior

- All transactions and settings are written to **Capacitor Preferences** (native key-value storage on-device) on every change, so the app works fully offline.
- On launch, data is read from local storage immediately and rendered.
- When the device is online, the app syncs with Supabase in the background: remote data is pulled and merged, and local writes are pushed. If a remote call fails, the local copy is kept and the user is not blocked.
- The `online`/`offline` events trigger automatic re-sync when connectivity returns.

## Updating the app icon

The icon is a vector drawable, so it scales cleanly to every density. Edit:

- Foreground: `android/app/src/main/res/drawable/ic_launcher_foreground.xml`
- Background: `android/app/src/main/res/drawable/ic_launcher_background.xml`

The adaptive icon references (`mipmap-anydpi-v26/ic_launcher.xml` and `ic_launcher_round.xml`) already point at these drawables. After editing, run `npx cap sync android` (no native change needed, but it keeps the project consistent) and rebuild.

## Updating the splash screen

Edit `android/app/src/main/res/drawable/splash.xml` (a vector drawable with the dark background + wallet logo). The `Theme.SplashScreen` style in `res/values/styles.xml` references it via `@drawable/splash`.

## Common issues

- **White screen on launch**: make sure `npm run build` ran and `dist/index.html` references `./assets/...` (relative paths). The Vite config uses `base: './'` for this.
- **Network calls fail**: the app only allows HTTPS to `supabase.co`. Don't switch the Supabase URL to HTTP.
- **Gradle sync failed**: open Android Studio's "Build → Clean Project", then "File → Sync Project with Gradle Files".
- **Changes not showing on device**: run `npm run cap:sync` again — the web assets in `android/app/src/main/assets/public/` only update when you sync.
