# RoamVerse — AI Travel Planning Platform

> **AI agents that turn your travel idea into a full trip plan in seconds.**

https://github.com/mohammadali-2000/Ai_travel/releases/download/v1.0.0/Project_Demo_FULL.mp4

---

RoamVerse is an AI-native travel planning app built for the **OpenAI Build Week Community Hackathon**. You describe where you want to go, and a team of 5 specialized AI agents collaboratively build you a complete, shareable travel plan — with a daily itinerary, budget breakdown, weather insights, food guide, and an interactive globe map.

---

## How it works

You type something like:
> *"Bhopal for 10 days solo under ₹15,000"*

RoamVerse's AI team gets to work:

| Agent | What it does |
|---|---|
| 🎨 **Experience Designer** | Shapes the emotional arc of your trip |
| 💰 **Budget Agent** | Balances every choice within your budget |
| ☀️ **Weather Agent** | Builds resilient moments around the forecast |
| 🍜 **Food Agent** | Finds local flavor and texture |
| 🗺️ **Journey Coordinator** | Unifies everything into one shareable Journey Drop |

The result: a beautiful, magazine-style travel plan with a live 3D globe route — ready to share.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React, TypeScript |
| Backend | FastAPI (Python 3.12) |
| AI | OpenAI Responses API + Agents SDK |
| Database | Supabase (Postgres + Auth + Storage) |
| Maps | react-globe.gl |
| Styling | Tailwind CSS |
| Deployment | Vercel (web) + container (API) |

---

## Folder Structure

```
apps/
  web/          → Next.js frontend (the UI you see)
  api/          → FastAPI backend (AI agent orchestration)
packages/
  shared-types/ → Shared TypeScript types across services
docs/           → Product and engineering docs
agents/         → AI agent specs and prompts
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- Python 3.12+
- An OpenAI API key
- A Supabase project (free tier works)

### 1. Clone & set up environment

```bash
git clone https://github.com/mohammadali-2000/Ai_travel.git
cd Ai_travel

# Copy env templates
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

Fill in your API keys in `apps/api/.env`:
```env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

### 2. Run the web app

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Run the API (optional — needed for full AI generation)

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e '.[dev]'
uvicorn app.main:app --reload
```

API runs at [http://localhost:8000](http://localhost:8000)

### 4. Set up the database

Apply the migration in your Supabase project's SQL editor:

```
supabase/migrations/202607180001_create_trips.sql
```

---

## Features

- ✅ Natural language trip input ("Goa next weekend under ₹30,000")
- ✅ Multi-agent AI orchestration (5 specialists)
- ✅ Day-by-day itinerary with timing and mood
- ✅ Budget breakdown per category
- ✅ Weather-aware planning
- ✅ Interactive 3D globe with route visualization
- ✅ Shareable "Journey Drop" link
- ✅ Works for Indian destinations with INR budget support

---

## Built by

[Mohammad Ali](https://github.com/mohammadali-2000) — Built for OpenAI Build Week Community Hackathon 2025
