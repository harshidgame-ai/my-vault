# My Vault V3 — iPhone/PWA version

## What this version adds
- Proper PWA manifest
- iPhone Home Screen metadata
- App icon
- Offline service worker/cache
- Standalone app display
- Portrait orientation
- Local-only savings data

## Install on iPhone
1. Host this folder on an HTTPS website.
2. Open the website in Safari on iPhone.
3. Tap Share.
4. Tap "Add to Home Screen".
5. Turn on "Open as Web App" if shown.
6. Tap Add.

The app then opens without the normal Safari browser UI.

## Important
The app still stores savings data in browser local storage. Use Settings → Export backup regularly.

For a true App Store/native build, wrap this project with Capacitor and open the iOS project in Xcode.
