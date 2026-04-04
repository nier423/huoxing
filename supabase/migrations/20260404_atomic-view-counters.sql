alter table public.issue_drawings
  add column if not exists view_count bigint not null default 0;

alter table public.issue_drawings
  drop constraint if exists issue_drawings_view_count_non_negative;

alter table public.issue_drawings
  add constraint issue_drawings_view_count_non_negative
  check (view_count >= 0);

comment on column public.issue_drawings.view_count is
  'Persisted view counter for the issue drawing detail page.';

create or replace function public.increment_article_view_count(p_article_id uuid)
returns bigint
language plpgsql
as $$
declare
  v_next bigint;
begin
  update public.articles
  set view_count = coalesce(view_count, 0) + 1
  where id = p_article_id
  returning view_count into v_next;

  return v_next;
end;
$$;

create or replace function public.increment_issue_drawing_view_count(p_drawing_id uuid)
returns bigint
language plpgsql
as $$
declare
  v_next bigint;
begin
  update public.issue_drawings
  set view_count = coalesce(view_count, 0) + 1
  where id = p_drawing_id
  returning view_count into v_next;

  return v_next;
end;
$$;

revoke all on function public.increment_article_view_count(uuid) from public, anon, authenticated;
grant execute on function public.increment_article_view_count(uuid) to service_role;

revoke all on function public.increment_issue_drawing_view_count(uuid) from public, anon, authenticated;
grant execute on function public.increment_issue_drawing_view_count(uuid) to service_role;
