# PRD — iPhone Settings Simulator + IMEI Checker

## Original Problem Statement
User (Bahasa Indonesia) wants a web app that clones the iPhone Settings app as completely as possible, but the content is only a simulation. The "About" section must be accurate, and IMEI + other fields must be editable from the server. There must be a dedicated public page to check by IMEI that returns data matching what was configured on the server. The admin login session must never expire.

## User Choices
- Editing device/About data via BOTH an admin panel and an API.
- IMEI check page is PUBLIC (no login).
- ALL About fields are editable.
- Admin-only login (no public user registration).
- UI must look as close to real iOS as possible.

## Architecture
- **Frontend**: React (CRA + craco), TailwindCSS, react-router, sonner toasts, lucide-react icons.
- **Backend**: FastAPI, Motor (MongoDB), bcrypt + PyJWT (Bearer token, no `exp` claim → never expires).
- **DB**: MongoDB. Collections: `users` (admin), `device` (singleton device config).

## Personas
- **Admin**: configures the simulated device data (IMEI, serial, model, storage, network, battery, status).
- **Public visitor**: verifies a device by IMEI; browses the iOS Settings simulation.

## Core Requirements (static)
- Accurate, editable About page fed by server data.
- Public IMEI lookup that matches server-configured IMEI / IMEI2.
- Non-expiring admin session.
- iOS-faithful Settings UI.

## Implemented (2026-06)
- Auth: POST /api/auth/login, GET /api/auth/me (Bearer, no-expiry JWT). Admin seeded from env, idempotent.
- Device API: GET /api/device (public), PUT /api/device (admin) — all ~27 About/identity/network/battery/status fields.
- Public IMEI: GET /api/imei/check?imei=xxx → found/not-found matching IMEI or IMEI2.
- Frontend: public IMEI checker (`/`), iOS Settings home (`/settings`), General (`/settings/general`), dynamic About (`/settings/general/about`), Admin login (`/admin/login`), Admin dashboard editor (`/admin`).
- Session persists via localStorage `admin_token`.
- Verified: backend 11/11, frontend 11/11 (testing agent iteration_1).

## Credentials
- Admin: admin@iphone.local / admin123
- Seeded IMEI: 356789104532198, IMEI2: 356789104532206

## Backlog / Remaining
- P1: More fully-simulated sub-pages (Wi-Fi list, Bluetooth devices, Storage breakdown) instead of toast placeholders.
- P2: Change-admin-password screen; multiple saved devices/profiles.
- P2: iOS lock-screen / home-screen shell around the Settings frame.

## iOS Native Packaging (2025-07)
Two SEPARATE native iOS apps via Capacitor 8 (SPM, no CocoaPods):
- Phone:    `mobile/phone/ios/App/App.xcodeproj`    — Bundle ID `com.iphonesim.phone`
- Settings: `mobile/settings/ios/App/App.xcodeproj` — Bundle ID `com.iphonesim.settings`
Both bundle a local production web build (webDir=www, no server.url → not a PWA),
pointing at REACT_APP_BACKEND_URL over HTTPS. Icons/splash generated from
resources/. Signing = Automatic (Personal Team ready), deployment target iOS 15.0.
Mac setup: `./mobile/ios-setup.sh` (yarn install + cap sync). Requires Node 22+.
NOTE: Actual Xcode compile / IPA / signing / TestFlight MUST run on macOS+Xcode
(not possible in the Linux build container).
