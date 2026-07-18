# System design

```text
Next.js web → FastAPI API → application services → agent runtime / tool adapters
                    ↓                 ↓
                Supabase         OpenAI Responses API
```

The API owns authorization, orchestration, persistence, rate limits, and observability. The web app consumes typed API contracts and only uses browser-safe Supabase capabilities. Prompts are source-controlled assets; their runtime loading and evaluation should be explicit.

## Boundaries

- `apps/web`: interaction, rendering, browser-safe clients.
- `apps/api`: transport, domain workflows, agent runtime, policy enforcement.
- `packages/shared-types`: API-facing TypeScript contracts only.
- `agents`: declarative role, capability, and safety specifications.
- `prompts`: versioned templates and evaluation fixtures.
