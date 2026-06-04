create or replace function public.get_admin_metrics()
returns json
language sql
security definer
set search_path = ''
as $$
  select json_build_object(
    'unique_players', (select count(distinct user_id) from public.scores),
    'total_submissions', (select count(*) from public.scores),
    'by_day', coalesce((
      select json_agg(
        json_build_object('day', day, 'players', players, 'submissions', submissions)
        order by day desc
      )
      from (
        select day,
               count(distinct user_id) as players,
               count(*)               as submissions
        from public.scores
        where day >= current_date - 90
        group by day
      ) per_day
    ), '[]'::json)
  );
$$;

grant execute on function public.get_admin_metrics() to anon;
