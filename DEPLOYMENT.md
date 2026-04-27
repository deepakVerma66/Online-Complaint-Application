# Deployment Guide

This project has:
- Backend: `backend` (Node.js + Express + MongoDB)
- Frontend: `frontend` (Expo React Native)

## 1) Deploy the backend first

Use any platform with a free tier (for example Render or Railway).

### Required backend environment variables
Set these on your backend hosting platform:

- `PORT=5000` (or use platform default port)
- `MONGO_URI=...`
- `BCRYPT_SALT_ROUNDS=10`
- `JWT_SECRET=...`

### Health check
After deploy, verify:

- `https://your-backend-domain.com/api/health`

You should receive a JSON success response.

## 2) Configure frontend to use deployed backend

In `frontend`, create `.env` from `.env.example`:

```bash
EXPO_PUBLIC_API_URL=https://your-backend-domain.com
```

Then start frontend locally:

```bash
cd frontend
npx expo start
```

## 3) Build Android app (APK/AAB) with EAS

From `frontend`:

```bash
npx eas login
npx eas build:configure
npx eas build -p android --profile preview
```

For production Play Store build:

```bash
npx eas build -p android --profile production
```

## 4) Build iOS app for sharing

For internal/testing distribution (requires Apple Developer account):

```bash
npx eas build -p ios --profile preview
```

For TestFlight/App Store:

```bash
npx eas build -p ios --profile production
```

## Notes

- Expo tunnel helps JS bundle access in development, but does not replace backend deployment.
- Without backend deployment, phones outside your local network cannot reach API endpoints.
- iOS distribution to friends normally uses TestFlight and requires Apple Developer Program membership.
