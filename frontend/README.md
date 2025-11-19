# Khel Saarthi Frontend

Expo + React Native client for the Khel Saarthi sports community platform.

## Requirements

- Node.js 18+
- npm 9+
- Expo CLI (`npx expo`) and Expo Go (phone) or iOS/Android simulator

## Environment Variables

The app expects a backend URL in `frontend/api/api.js`. Update `API_BASE_URL` to point to your running backend (default is LAN IP during development).

## Installation

```bash
cd frontend
npm install
npx expo start
```

Use `i` to open the iOS simulator or scan the QR code with Expo Go. Ensure the device can reach the backend host/port (LAN or tunnel).

## Key Screens

- Home: event discovery, category filters, stats
- Event Details: RSVP/join event, host info
- Create/Edit Event: available for hosts, includes form validation
- Chat: per-event real-time chat using Socket.IO
- Profile & Badminton Profile: edit skills, view stats
- Authentication: login and registration flow with JWT-based persistence

## Development Tips

- Update `API_BASE_URL` when your backend IP changes.
- Run with `npx expo start --tunnel` if devices cannot reach LAN IP.
- Use React DevTools + Metro console for logs.
- Linting/tests not configured yet; run Expo’s type checking via `npx expo doctor`.
