-- M5 leaderboard: scores table, RLS, and get_standing RPC.
-- Clients never write directly; all inserts go through the edge function (service role).
-- Reads happen only through the get_standing RPC, not raw table access.

create table scores (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  day         date not null,
  grid_size   smallint not null,
  moves       integer not null,
  elapsed_ms  integer not null,
  created_at  timestamptz not null default now(),
  unique (user_id, day, grid_size)
);

alter table scores enable row level security;
-- No client INSERT/UPDATE policy: writes are service-role only (edge function).
-- No client SELECT policy: reads go through the get_standing RPC below.

-- Returns { rank, total } for the caller's score on a given day and grid size.
-- rank  = count of strictly-better scores + 1 (moves ASC, elapsed_ms ASC).
-- total = number of scores recorded for this day and grid size.
create or replace function get_standing(
  p_day        date,
  p_grid_size  smallint,
  p_moves      integer,
  p_elapsed_ms integer
)
returns json
language sql
security definer
set search_path = ''
as $$
  select json_build_object(
    'rank', (
      select count(*) + 1
      from public.scores
      where day = p_day
        and grid_size = p_grid_size
        and (
          moves < p_moves
          or (moves = p_moves and elapsed_ms < p_elapsed_ms)
        )
    ),
    'total', (
      select count(*)
      from public.scores
      where day = p_day
        and grid_size = p_grid_size
    )
  );
$$;
