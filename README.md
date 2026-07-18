# RoamVerse — AI Agent Travel Platform

RoamVerse is an AI-first social travel experience built for the OpenAI Build Week Community Hackathon. It is designed around coordinated specialist agents that turn travel intent, live context, and shareable moments into decisions people want to post—not a generic planner or chatbot.

## Product direction

The platform will combine travel intelligence with viral social loops: collaborative trips, remixable travel "drops", visual story generation, and agent-led discovery. The initial architecture keeps those capabilities modular so the team can experiment quickly.

## Repository layout

```text
apps/
  web/              Next.js 15 user experience
  api/              FastAPI agent orchestration API
packages/
  shared-types/     Cross-service TypeScript contracts
docs/               Product, engineering, and runbook documentation
architecture/       System design and decision records
prompts/            Versioned AI prompt assets
agents/             Agent specifications and tool contracts
```

## Stack

- **Web:** Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui-ready primitives
- **API:** FastAPI + Python 3.12
- **AI:** OpenAI Responses API; Agents SDK integration boundary
- **Data:** Supabase (Postgres, Auth, Realtime, Storage)
- **Deployment:** Vercel for web; container-compatible API deployment

## Getting started

1. Copy the root template: `cp .env.example .env`.
2. Copy service templates: `cp apps/web/.env.local.example apps/web/.env.local` and `cp apps/api/.env.example apps/api/.env`.
3. Fill only the credentials required for the service you run.
4. Install and start the web app:

   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

5. Set up and run the API:

   ```bash
   cd apps/api
   python -m venv .venv
   source .venv/bin/activate
   pip install -e '.[dev]'
   uvicorn app.main:app --reload
   ```

## Configure the full MVP

The journey workflow requires both OpenAI and Supabase credentials in `apps/api/.env`:

```dotenv
OPENAI_API_KEY=...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

Apply [`supabase/migrations/202607180001_create_trips.sql`](supabase/migrations/202607180001_create_trips.sql) in the Supabase SQL editor or through the Supabase CLI before creating trips. The service-role credential is used only by FastAPI and must never be placed in browser-visible environment variables.

With the API and web application running, enter a destination, dates, budget, and a travel intent. RoamVerse invokes the Experience Designer, Budget, Weather, and Food agents before the Journey Coordinator saves and renders a shareable Journey Drop.

## Documentation

- [Product vision](docs/product-vision.md)
- [Development guide](docs/development.md)
- [System architecture](architecture/system-design.md)
- [API conventions](docs/api-conventions.md)
- [Agent catalog](agents/README.md)

## Engineering principles

1. Keep agent orchestration server-side and observable.
2. Treat prompts and agent configurations as versioned product assets.
3. Share contracts, not implementation, across service boundaries.
4. Default to privacy, consent, and cost controls for every AI capability.
5. Build social primitives that make useful outputs naturally shareable.
