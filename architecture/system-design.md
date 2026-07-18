# System design

```text
Next.js web → FastAPI API → application services → agent runtime / tool adapters
                    ↓                 ↓
                Supabase         OpenAI Responses API
```

The API owns authorization, orchestration, persistence, rate limits, and observability. The web app consumes typed API contracts and only uses browser-safe Supabase capabilities. Prompts are source-controlled assets; their runtime loading and evaluation should be explicit.

## MVP request flow

```text
Intent composer → POST /api/v1/journeys/concept/stream → Coordinator → Responses API
       ↑                                                              ↓
       └─────────────── SSE text deltas / rendered Journey Drop ──────┘
```

The coordinator is the only runtime-enabled agent in the first slice. It has no external tools, so it cannot make bookings or claims based on unavailable live data. Specialist agents are declarative until their corresponding tool policy, evaluations, and observability are implemented.

## Boundaries

- `apps/web`: interaction, rendering, browser-safe clients.
- `apps/api`: transport, domain workflows, agent runtime, policy enforcement.
- `packages/shared-types`: API-facing TypeScript contracts only.
- `agents`: declarative role, capability, and safety specifications.
- `prompts`: versioned templates and evaluation fixtures.
