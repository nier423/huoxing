-- Migration: add issue drawing comments restricted to published V3 issues
--
-- Notes:
-- - One comment stream per issue (`issue_id`)
-- - Public reads go through anon/authenticated RLS
-- - Inserts are limited to the signed-in user on published V3 issues
-- - Deletes are limited to the comment owner

create table if not exists public.issue_drawing_comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.issue_drawing_comments
  drop constraint if exists issue_drawing_comments_content_not_empty;

alter table public.issue_drawing_comments
  add constraint issue_drawing_comments_content_not_empty
  check (content ~ '[^[:space:]]');

create index if not exists issue_drawing_comments_issue_created_idx
  on public.issue_drawing_comments (issue_id, created_at asc);

comment on table public.issue_drawing_comments is
  'Comments for the drawing section; only published V3 issues are visible via RLS.';

create or replace function public.issue_label_to_number(p_label text)
returns integer
language sql
immutable
as $$
  select ((regexp_match(trim(coalesce(p_label, '')), '(?i)^v([0-9]+)$'))[1])::integer;
$$;

create or replace function public.issue_label_is_v3(p_label text)
returns boolean
language sql
immutable
as $$
  select public.issue_label_to_number(p_label) = 3;
$$;

create or replace function public.is_v3_published_issue(p_issue_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.issues i
    where i.id = p_issue_id
      and i.published_at is not null
      and i.published_at <= now()
      and public.issue_label_is_v3(i.label)
  );
$$;

alter table public.issue_drawing_comments enable row level security;

drop policy if exists issue_drawing_comments_public_select on public.issue_drawing_comments;
create policy issue_drawing_comments_public_select
on public.issue_drawing_comments
for select
to anon, authenticated
using (public.is_v3_published_issue(issue_id));

drop policy if exists issue_drawing_comments_insert_own on public.issue_drawing_comments;
create policy issue_drawing_comments_insert_own
on public.issue_drawing_comments
for insert
to authenticated
with check (
  auth.uid() = user_id
  and public.is_v3_published_issue(issue_id)
);

drop policy if exists issue_drawing_comments_delete_own on public.issue_drawing_comments;
create policy issue_drawing_comments_delete_own
on public.issue_drawing_comments
for delete
to authenticated
using (auth.uid() = user_id);
