# Momentum
Momentum is a premium full-stack productivity dashboard built with React + TypeScript frontend and Express + Prisma backend, using Supabase for authentication and PostgreSQL storage.

## What This App Does
- Secure signup/signin with Supabase Auth
- User-scoped tasks (each user only sees their own tasks)
- Full CRUD task management
- Today-focused productivity dashboard
- Task status analytics and daily stats
- Energy-based task grouping
- Premium UI with animations, command palette, onboarding, dark mode

## Tech Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, TypeScript, Zod
- Database: PostgreSQL (Supabase) via Prisma
- Auth: Supabase Auth

## Project Structure
- `frontend/`: React client app
- `backend/`: API server + Prisma
- `backend/prisma/schema.prisma`: Prisma data model

## Prerequisites
- Node.js 18+
- npm
- Supabase project

## Environment Setup

### Frontend env (`frontend/.env`)
```env
VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_PUBLISHABLE_KEY"
```

### Backend env (`backend/.env`)
```env
SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
SUPABASE_ANON_KEY="YOUR_SUPABASE_PUBLISHABLE_KEY"

# Runtime connection (can be pooler URL)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres"

# Direct/session connection for Prisma operations
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres"

PORT=5001
NODE_ENV=development
```

Notes:
- If your password contains special characters (`@`, `#`, etc.), URL-encode them in DB URLs.
- Never commit real secrets to git.

## Install Dependencies
From root:
```bash
npm install
npm run install:all
```

If needed separately:
```bash
npm install --prefix frontend
npm install --prefix backend
```

## Database Setup (Important)
Apply schema to Supabase DB before running app:

```bash
cd backend
npx prisma db push --schema prisma/schema.prisma
```

Then regenerate client:
```bash
npm run prisma:generate
```

## Run the App
From root:
```bash
npm run dev
```

Default URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

If 5173 is occupied, Vite may use another port (like 5174).

## Auth Flow
1. Open app
2. Sign up with email/password
3. If email confirmation is enabled in Supabase, verify email
4. Sign in
5. Create and manage tasks

## Common Issues & Fixes

### 1) White screen on startup
- Ensure frontend env keys are present:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
- Restart frontend after changing env:
  ```bash
  npm run dev --prefix frontend
  ```

### 2) `P2021: The table public.Task does not exist`
- Run Prisma schema sync:
  ```bash
  cd backend
  npx prisma db push --schema prisma/schema.prisma
  ```

### 3) `429 Too Many Requests` on signup/signin
- This is Supabase rate limiting.
- Wait briefly and retry.
- Avoid repeated rapid submits.

### 4) `400 Invalid login credentials`
- Use an account created via Sign Up.
- Confirm email if required by Supabase settings.

## Available Scripts

### Root
- `npm run dev` — run frontend + backend concurrently
- `npm run install:all` — install frontend + backend dependencies
- `npm run build:all` — build frontend + backend

### Backend
- `npm run dev --prefix backend`
- `npm run build --prefix backend`
- `npm run prisma:generate --prefix backend`
- `npm run prisma:migrate --prefix backend`
- `npm run prisma:seed --prefix backend` (no demo task insert)

### Frontend
- `npm run dev --prefix frontend`
- `npm run build --prefix frontend`

## Current UI Highlights
- Updated Momentum brand logo (dot-ring + orange “o”)
- Command palette (`Ctrl/Cmd + K`)
- Onboarding and profile personalization
- Optimistic task updates
- Today task stats section

## Security Reminder
Rotate any credentials that were shared in plain text and move all secrets to environment files only.
