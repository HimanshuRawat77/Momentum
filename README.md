# Momentum 🚀
A modern, decoupled full-stack productivity dashboard designed for creators and startups. Momentum moves away from generic task managers by focusing on daily focus alignment, self-reported energy optimization, and gamified progress mechanics.

---

## 🎨 Visual Philosophy & UX Style
- **Minimal SaaS Aesthetic:** Inspired by modern interfaces from Apple and Linear.
- **Glassmorphic Accents:** Card backdrops utilize translucent styling, smooth border reflections, and soft drop shadows.
- **Theme-Aware:** Seamlessly switches between light and dark modes with custom-tailored color properties.
- **Motion Polish:** Animated lists, column shifts, and alert modules powered by **Framer Motion**.

---

## ⚡ Unique Features
1. **Daily Focus Dashboard:** Align your day with a greeting, overdue agenda indicators, and a gamified radial score progress ring.
2. **Stamina Recommendation Engine:** Declare your current stamina level (🔋 Low, ⚡ Medium, 🔥 High) and receive instant, corresponding recommendations from your active backlog to start working on.
3. **GitHub-Style Contribution Grid:** Visualizes your task completions over the past 24 weeks, color-coded by daily completion density.
4. **Task Master Backlog:** A dual-interface workspace allowing you to toggle between a filtered search list grid and an Energy-based Kanban columns board.
5. **Robust Demo Mode:** Works out-of-the-box! If no Supabase connection URL is provided, the API automatically triggers local JSON file database fallback mode.

---

## 🛠️ Tech Stack
- **Frontend Client:** React.js (Vite + TypeScript) + Tailwind CSS + Framer Motion + Recharts
- **API Server:** Node.js (Express + TypeScript) + Zod Request Validation
- **Database Layer:** Prisma ORM supporting PostgreSQL (Supabase) + local JSON file fallback

---

## 🗄️ Database Schema
```prisma
model Task {
  id          String      @id @default(uuid())
  title       String
  description String?
  status      Status      @default(TODO)
  priority    Priority    @default(MEDIUM)
  energyLevel EnergyLevel @default(MEDIUM)
  category    String
  dueDate     DateTime
  completedAt DateTime?   // Set to current date-time upon completion, reset on revert
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum Status {
  TODO
  IN_PROGRESS
  COMPLETED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

enum EnergyLevel {
  LOW
  MEDIUM
  HIGH
}
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Initialize Dependencies
From the root directory, run:
```bash
npm install
npm run install:all
```
This installs root dependencies (like `concurrently`) and hooks into both `/frontend` and `/backend` to install their respective node packages.

### 2. Configure Environment Variables
Inside the `backend/` directory, copy `.env` configurations:
```env
# backend/.env
PORT=5001
NODE_ENV=development
SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"

# Optional: Supabase Database URL (PostgreSQL)
# Format: postgresql://[user]:[password]@[host]:[port]/[db-name]?schema=public
# Required for Prisma task storage:
DATABASE_URL="postgresql://postgres:your-supabase-password@db.xxxxxxxxxx.supabase.co:5432/postgres?schema=public"
```

Inside the `frontend/` directory, add:
```env
# frontend/.env
VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"
```

### 3. Run the Development Servers
From the root directory, boot both servers concurrently:
```bash
npm run dev
```
- **React Frontend:** running on `http://localhost:5173`
- **Express API Backend:** running on `http://localhost:5001`

### 4. Seed Database (Optional)
If running with a Supabase PostgreSQL instance:
1. Generate Prisma client: `npm run prisma:generate`
2. Push migrations: `npm run prisma:migrate`
3. Seed command intentionally inserts no demo tasks: `npm run prisma:seed`

The app now uses Supabase Auth (signup/login) and only shows tasks created by the authenticated user.
# Momentum
