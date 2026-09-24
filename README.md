# 🧠 Live Collaborative Idea Board

A real-time collaborative idea board built for virtual hackathon presentations. Audience members can submit ideas and questions, upvote them in real time, and see who else is currently viewing the board — all updating instantly across every connected browser.

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat&logo=next.js) ![Flask](https://img.shields.io/badge/Flask-000000?style=flat&logo=flask) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

---

## 📐 Architecture Overview

The application follows a **split responsibility** pattern where writes are validated server-side while reads leverage direct real-time connections:

```
                          ┌──────────────────────────────────────────────────┐
                          │              Supabase (Cloud)                    │
                          │                                                  │
                          │  ┌──────────────┐  ┌────────────────────────┐   │
         REST Insert/RPC  │  │  PostgreSQL   │  │  Realtime Engine       │   │
       ┌─────────────────▶│  │              │──▶│  (WebSocket Server)    │   │
       │                  │  │  ideas table  │  │                        │   │
       │                  │  │  RLS policies │  │  • Broadcasts INSERT   │   │
       │                  │  │  increment_   │  │  • Broadcasts UPDATE   │   │
       │                  │  │  upvotes()    │  │  • Broadcasts DELETE   │   │
       │                  │  └──────────────┘  └───────────┬────────────┘   │
       │                  │                                 │                │
       │                  │                    ┌────────────┴───────────┐   │
       │                  │                    │  Presence Engine        │   │
       │                  │                    │  (Track active users)   │   │
       │                  │                    └────────────┬───────────┘   │
       │                  └─────────────────────────────────┼──────────────┘
       │                                                    │
       │                                                    │ WebSocket
       │                                                    │ (Live push)
       │                                                    │
┌──────┴──────────┐     HTTP POST              ┌────────────▼───────────┐
│  Flask Backend  │◀───────────────────────────│   Next.js Frontend     │
│  (Port 5000)    │                            │   (Port 3000)          │
│                 │     JSON Response          │                        │
│  • Validation   │───────────────────────────▶│  • Idea submission UI  │
│  • POST /ideas  │                            │  • Live feed           │
│  • POST /upvote │                            │  • Presence indicator  │
│  • Error msgs   │                            │  • Display name editor │
└─────────────────┘                            │  • Framer Motion anims │
                                               └────────────────────────┘
```

### Data Flow Patterns

| Operation | Flow | Protocol |
|-----------|------|----------|
| **Create idea** | Browser → Flask (validate) → Supabase (insert) → Realtime → All browsers | HTTP + WebSocket |
| **Upvote idea** | Browser → Flask → Supabase RPC `increment_upvotes()` → Realtime → All browsers | HTTP + WebSocket |
| **Initial load** | Browser → Supabase REST API (fetch all ideas) | HTTP |
| **Live updates** | Supabase Realtime → Browser (INSERT/UPDATE/DELETE events) | WebSocket |
| **Presence** | Browser ↔ Supabase Presence channel (track/sync) | WebSocket |

### Why This Architecture?

- **Writes through Flask**: The assignment requires Flask to handle validation (text non-empty, ≤200 chars). The Flask backend uses the **service_role key** (full DB access) and never exposes it to the browser.
- **Reads from Supabase directly**: The assignment permits using Supabase's auto-generated API for reads. Direct WebSocket subscriptions give sub-100ms latency for live updates.
- **Atomic upvotes**: A PostgreSQL function (`increment_upvotes`) uses `SET upvotes = upvotes + 1` to prevent race conditions when multiple users upvote simultaneously.

---

## 🗄️ Database Schema

```sql
CREATE TABLE ideas (
    id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
    text        TEXT          NOT NULL CHECK (char_length(text) <= 200),
    upvotes     INTEGER       DEFAULT 0,
    created_at  TIMESTAMPTZ   DEFAULT now()
);
```

Row Level Security is enabled with permissive policies (no auth per assignment requirements). Realtime broadcasting is enabled via PostgreSQL logical replication.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+ and pip
- A free **[Supabase](https://supabase.com)** project

### 1. Database Setup

Open your Supabase project → **SQL Editor** → **New Query** → paste and run [`supabase/setup.sql`](supabase/setup.sql). This creates the table, RLS policies, realtime config, and upvote function.

### 2. Backend (Flask)

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Configure environment variables in `backend/.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
FLASK_PORT=5000
```

Start the Flask server:

```bash
python app.py
# 🚀 Idea Board API running on http://localhost:5000
```

### 3. Frontend (Next.js)

```bash
cd frontend
npm install
```

Configure environment variables in `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key
NEXT_PUBLIC_FLASK_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
# ▲ Next.js running on http://localhost:3000
```

### 4. Open & Test

1. Visit **http://localhost:3000** in two separate browser tabs
2. Submit an idea in one tab — watch it appear instantly in both
3. Upvote an idea — watch the count update and cards reorder in real time
4. Check the presence indicator — it shows both tabs as active viewers

---

## ✅ Features

### Core Requirements

| Feature | Status | Details |
|---------|--------|---------|
| Submit ideas via Flask | ✅ | `POST /api/ideas` with validation |
| Input validation | ✅ | Non-empty, ≤200 characters, whitespace trimming |
| Live feed | ✅ | Supabase Realtime subscriptions (INSERT/UPDATE/DELETE) |
| Upvoting | ✅ | Atomic increment via PostgreSQL function |
| Presence indicator | ✅ | Shows active user count via Supabase Presence |

### Bonus Features

| Feature | Status | Details |
|---------|--------|---------|
| Display names | ✅ | Stored in localStorage, visible in Presence tracker |
| Animations | ✅ | Framer Motion: card enter/exit, upvote count flip, layout reordering |
| Real-time sorting | ✅ | Ideas dynamically sort by most upvoted |

---

## 🛠️ Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | Next.js 16 + TypeScript | App Router, React components, SSR metadata |
| Styling | Tailwind CSS v4 | Dark mode design system, utility-first classes |
| Animations | Framer Motion | Spring physics, layout animations, AnimatePresence |
| Icons | Lucide React | Consistent, lightweight icon set |
| Backend | Flask (Python) | REST API, request validation, Supabase writes |
| Database | Supabase PostgreSQL | Data storage, RLS policies, atomic functions |
| Real-time | Supabase Realtime | WebSocket-based live data subscriptions |
| Presence | Supabase Presence | Active user tracking with metadata |

---

## 📡 API Endpoints (Flask)

### `POST /api/ideas` — Create Idea

**Request:**
```json
{ "text": "We should add dark mode to the dashboard" }
```

**Validation:**
- `text` is required and must be a string
- Cannot be empty or whitespace-only
- Maximum 200 characters

**Success Response (201):**
```json
{
    "id": "a1b2c3d4-...",
    "text": "We should add dark mode to the dashboard",
    "upvotes": 0,
    "created_at": "2026-09-24T18:30:00+00:00"
}
```

**Error Response (400):**
```json
{ "error": "Idea text must be 200 characters or less (currently 215 characters)" }
```

### `POST /api/ideas/:id/upvote` — Upvote Idea

**Request:** No body required.

**Success Response (200):**
```json
{ "success": true }
```

### `GET /api/health` — Health Check

**Response (200):**
```json
{ "status": "ok", "service": "idea-board-api" }
```

---

## 📁 Project Structure

```
├── backend/
│   ├── app.py                 # Flask API server (validation + Supabase writes)
│   ├── requirements.txt       # Python deps: flask, flask-cors, requests, dotenv
│   ├── .env                   # SUPABASE_URL, SUPABASE_SERVICE_KEY (secret)
│   └── venv/                  # Python virtual environment (gitignored)
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx     # Root layout: fonts, metadata, HTML shell
│   │   │   ├── page.tsx       # Main page: composes all components
│   │   │   └── globals.css    # Tailwind v4 dark theme, glassmorphism, animations
│   │   ├── components/
│   │   │   ├── IdeaForm.tsx          # Submit form with char counter
│   │   │   ├── IdeaCard.tsx          # Single idea: text, upvote btn, animations
│   │   │   ├── IdeaFeed.tsx          # Idea list with AnimatePresence
│   │   │   ├── PresenceIndicator.tsx # Online user count + names
│   │   │   └── DisplayNameEditor.tsx # Inline name editor
│   │   ├── hooks/
│   │   │   ├── useIdeas.ts    # Real-time ideas subscription + sorting
│   │   │   └── usePresence.ts # Presence channel tracking
│   │   └── lib/
│   │       ├── supabase.ts    # Supabase client initialization
│   │       ├── types.ts       # TypeScript interfaces (Idea, PresenceUser)
│   │       └── utils.ts       # cn(), timeAgo(), localStorage helpers
│   ├── .env.local             # Public Supabase URL/key, Flask API URL
│   ├── package.json
│   └── tsconfig.json
│
├── supabase/
│   └── setup.sql              # DB migration: table, RLS, realtime, functions
│
├── .gitignore
└── README.md
```

---

## 🔐 Security Notes

- The **service_role key** is only used server-side in Flask (never exposed to the browser)
- The **publishable/anon key** is used client-side and is safe because RLS policies restrict access
- User identity is a random UUID via `crypto.randomUUID()` stored in localStorage (per assignment spec — no auth)
- For production: add rate limiting, CAPTCHA, authentication, and scoped RLS policies
