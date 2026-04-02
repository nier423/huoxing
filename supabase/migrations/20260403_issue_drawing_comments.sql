-- 画里话外：仅「第三看」（label 规范为 V3 / v3）且已上线期刊下的留言，读写经 RLS。

create table if not exists public.issue_drawing_comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  constraint issue_drawing_comments_content_not_empty check (length(trim(content)) > 0)
);

create index if not exists issue_drawing_comments_issue_created_idx
  on public.issue_drawing_comments (issue_id, created_at asc);

comment on table public.issue_drawing_comments is '画里话外评论区；仅第三看（V3）已发布期刊。';

-- 与前端 getIssueNumberFromLabel(V3) 对齐：规范化后为 V3
create or replace function public.issue_label_is_v3(p_label text)
returns boolean
language sql
immutable
as $$
  select upper(regexp_replace(trim(coalesce(p_label, '')), '^v', 'V', 'i')) = 'V3';
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
