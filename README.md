# DFamily-Weights

A family weight challenge MVP: log weekly weights, track progress, and compete on the leaderboard. Built with Next.js, Tailwind, Firebase, and Recharts.

## Overview

- **Purpose**: Let family members (20+) create accounts, log weekly weight, view progress, and see a group leaderboard.
- **Stack**: Next.js (Pages), Tailwind CSS, Firebase (Gmail auth + Firestore), Recharts.

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase config:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

### 3. Firebase setup

1. Create a [Firebase](https://console.firebase.google.com/) project.
2. Enable **Authentication** → Sign-in method → **Google**.
3. Create **Firestore** database.
4. Deploy indexes: `firebase deploy --only firestore:indexes` (after `firebase init`).
5. Deploy rules: `firebase deploy --only firestore:rules`.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Jest tests |
| `npm run seed` | Seed sample users + weights (needs `firebase-admin` + `GOOGLE_APPLICATION_CREDENTIALS`) |
| `npm run export-data` | Export leaderboard CSV (optional: pass weeks, e.g. `node scripts/export-data.js 4`) |

## Firebase Admin (seed/export)

For `npm run seed` and `npm run export-data`:

1. Create a service account: Firebase Console → Project Settings → Service accounts → Generate new private key.
2. Save the JSON file and set `GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`.
3. Install `firebase-admin`: `npm install firebase-admin` (or use optionalDependencies).

## Deployment (Vercel)

1. Connect your repo to [Vercel](https://vercel.com).
2. Add environment variables from `.env.local` (prefix with `NEXT_PUBLIC_` for client vars).
3. Build command: `npm run build`
4. Output directory: `.next`

## Data model

### `users`

- `id` (uid)
- `name`, `email`, `photoURL` (optional)
- `startWeight`, `targetWeight`
- `createdAt`

### `weights`

- `userId`, `weight`, `weekStart` (ISO yyyy-mm-dd, Monday)
- `createdAt`, `updatedAt`

One weight record per `(userId, weekStart)`. New submissions in the same week replace the existing record.

## API

- `GET /api/weeklySummary?weeks=4` — Returns leaderboard entries for last N weeks (JSON).

## Suggested commits

- `init: nextjs + tailwind`
- `feat: add auth and profile`
- `feat: add weight logging and firestore`
- `feat: add dashboard + charts`
- `test: add basic tests`

## What we assumed

- Week starts Monday (ISO).
- Weight in lbs (30–800 range).
- Top-level `weights` collection with composite index on `(userId, weekStart)`.
- Gmail = Google Sign-In.
