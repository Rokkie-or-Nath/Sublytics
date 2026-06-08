# 💎 Sublytics

**Subscription Intelligence Platform** — Track, analyze, and optimize all your subscriptions in one place.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app loads on **http://localhost:5173/**. Without Supabase configured, you'll see a setup screen with instructions.

---

## 🗄️ Database Setup (Supabase)

Sublytics stores all user data in **Supabase** (PostgreSQL + Auth). You need a Supabase project to use the app.

### Step 1: Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project (free tier is fine)
3. Wait for the database to provision (~2 minutes)

### Step 2: Apply the schema

1. In your Supabase Dashboard, go to **SQL Editor**
2. Open a **New Query**
3. Paste the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run** — this creates all tables, indexes, Row Level Security policies, and the auto-profile trigger

### Step 3: Disable email confirmation (IMPORTANT)

1. Go to your Supabase Dashboard → **Authentication** → **Settings**
2. Find **"Confirm email"** — set it to **OFF**
3. Save the change

> If you leave email confirmation ON, users will get **"Email not confirmed"** errors when trying to sign in. The app currently does not handle email verification flows.

### Step 4: Configure the `.env` file

Your project credentials are in **Project Settings → API**:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your project URL (e.g. `https://xxxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your anon/public key (NOT the `service_role` key) |

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Restart the dev server

```bash
npm run dev
```

---

## 📋 Features

- **Dashboard** — Overview of monthly spending, upcoming bills, and recent activity
- **Subscription Management** — Add, edit, pause, cancel, or delete subscriptions
- **Analytics** — Spending trends, category breakdowns, and savings insights
- **Settings** — Currency, budget, notifications, and email alerts
- **Authentication** — Sign up / sign in via Supabase Auth (magic link or email/password)
- **Row Level Security** — Every user only sees their own data, enforced by PostgreSQL RLS

---

## 🏗️ Project Structure

```
Sublytics/
├── src/
│   ├── components/          # UI components
│   │   ├── auth/            # Login/signup components
│   │   ├── dashboard/       # Dashboard cards & charts
│   │   ├── layout/          # Header, sidebar, layout wrapper
│   │   ├── subscriptions/   # Subscription cards & modals
│   │   ├── shared/          # ErrorBoundary, ConfirmDialog
│   │   └── ui/              # Reusable primitives (Button, Card, Input, etc.)
│   ├── pages/               # Route-level pages
│   ├── store/               # Zustand global state
│   ├── lib/                 # Data layer (Supabase client, DB, service)
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Helper functions
├── supabase/
│   └── migrations/          # Database schema (run this in Supabase SQL Editor)
└── supabase/functions/      # Edge Functions (optional, for account deletion)
```

---

## 🧪 Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (fast HMR) |
| `npm run build` | Production build (single HTML file) |
| `npm run preview` | Preview the production build |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

---

## 🔐 Security

- **Row Level Security (RLS)** is enabled on all tables — users can only access their own data
- **Anon key only** is used in the frontend (the `service_role` key is never exposed)
- Auth is handled entirely by Supabase (bcrypt hashing, session management, PKCE flow)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| State | Zustand |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Charts | Recharts |
| Auth & DB | Supabase (PostgreSQL + Auth) |
| Build | Vite |
| Icons | Lucide React |