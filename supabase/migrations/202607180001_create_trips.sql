create table if not exists public.trips (
  id uuid primary key, owner_id text not null, destination text not null,
  start_date date not null, end_date date not null, budget integer not null,
  currency text not null, travelers integer not null, intent text not null default '',
  share_slug text not null unique, experience jsonb not null, agents jsonb not null,
  created_at timestamptz not null default now(),
  constraint trip_date_order check (end_date >= start_date),
  constraint trip_budget_positive check (budget > 0)
);
create index if not exists trips_owner_created_at_idx on public.trips (owner_id, created_at desc);
create index if not exists trips_share_slug_idx on public.trips (share_slug);
alter table public.trips enable row level security;
-- The API uses the Supabase service role. Keep direct client access disabled until Supabase Auth is added.
