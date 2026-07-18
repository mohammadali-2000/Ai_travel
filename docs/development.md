# Development guide

Use Node 20+ and Python 3.12+. Keep secrets in untracked `.env` files. Validate web changes with `npm run typecheck` and API changes with `ruff check .` plus focused tests.

Use conventional, focused commits. Prompt changes require an accompanying evaluation case before production use.

### Local configuration

Run the database migration before testing trip creation. The web app identifies an unauthenticated workspace with a browser-local UUID; production authentication should replace this with Supabase Auth before public launch. The FastAPI process owns `SUPABASE_SERVICE_ROLE_KEY` and is the only component permitted to write trip records.
