-- daily_par: offline-computed par per game-day and grid size.
-- Written only by the compute-par GitHub Actions job (service role).
-- Clients read directly via anon role (public SELECT policy below).
-- Keyed by (date, grid_size); generation_hash guards against engine drift.

create table daily_par (
  id              uuid primary key default gen_random_uuid(),
  date            date not null,
  grid_size       smallint not null,
  par             integer not null,
  proven          boolean not null,
  generation_hash text not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (date, grid_size)
);

alter table daily_par enable row level security;

-- Clients (anon role) may SELECT any row.
create policy "anon_select" on daily_par
  for select using (true);

-- No INSERT/UPDATE policy for anon: all writes are service-role only (GH Actions).

-- Auto-stamp updated_at on every update.
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_daily_par_updated_at
  before update on daily_par
  for each row execute function set_updated_at();
