-- Migration: add explicit debate topic scheduling and RLS policies
--
-- Why:
-- 1. Debate topics need editor-managed start/end times instead of an implicit
--    fixed duration.
-- 2. Public debate reads must use the anon key with RLS instead of the
--    Service Role key.

alter table public.debate_topics
  add column if not exists ends_at timestamptz;

update public.debate_topics
set ends_at = starts_at + interval '3 days'
where starts_at is not null
  and ends_at is null;

alter table public.debate_topics
  drop constraint if exists debate_topics_schedule_window_check;

alter table public.debate_topics
  add constraint debate_topics_schedule_window_check
  check (
    (starts_at is null and ends_at is null)
    or (
      starts_at is not null
      and ends_at is not null
      and ends_at > starts_at
    )
  );

create index if not exists debate_topics_issue_sort_idx
  on public.debate_topics (issue_id, sort_order, created_at);

create index if not exists debate_topics_schedule_idx
  on public.debate_topics (issue_id, starts_at, ends_at);

create index if not exists debate_comments_topic_created_idx
  on public.debate_comments (topic_id, created_at);

create index if not exists debate_comment_likes_comment_user_idx
  on public.debate_comment_likes (comment_id, user_id);

create index if not exists debate_comment_dislikes_comment_user_idx
  on public.debate_comment_dislikes (comment_id, user_id);

alter table public.debate_topics enable row level security;
alter table public.debate_comments enable row level security;
alter table public.debate_comment_likes enable row level security;
alter table public.debate_comment_dislikes enable row level security;

drop policy if exists debate_topics_public_select on public.debate_topics;
create policy debate_topics_public_select
on public.debate_topics
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.issues
    where issues.id = debate_topics.issue_id
      and issues.published_at is not null
      and issues.published_at <= now()
  )
);

drop policy if exists debate_comments_public_select on public.debate_comments;
create policy debate_comments_public_select
on public.debate_comments
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.debate_topics
    join public.issues on issues.id = debate_topics.issue_id
    where debate_topics.id = debate_comments.topic_id
      and issues.published_at is not null
      and issues.published_at <= now()
  )
);

drop policy if exists debate_comments_insert_own on public.debate_comments;
create policy debate_comments_insert_own
on public.debate_comments
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.debate_topics
    join public.issues on issues.id = debate_topics.issue_id
    where debate_topics.id = debate_comments.topic_id
      and issues.published_at is not null
      and issues.published_at <= now()
      and debate_topics.starts_at is not null
      and debate_topics.ends_at is not null
      and debate_topics.starts_at <= now()
      and debate_topics.ends_at > now()
  )
);

drop policy if exists debate_comments_delete_own on public.debate_comments;
create policy debate_comments_delete_own
on public.debate_comments
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists debate_comment_likes_public_select on public.debate_comment_likes;
create policy debate_comment_likes_public_select
on public.debate_comment_likes
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.debate_comments
    join public.debate_topics on debate_topics.id = debate_comments.topic_id
    join public.issues on issues.id = debate_topics.issue_id
    where debate_comments.id = debate_comment_likes.comment_id
      and issues.published_at is not null
      and issues.published_at <= now()
  )
);

drop policy if exists debate_comment_likes_insert_own on public.debate_comment_likes;
create policy debate_comment_likes_insert_own
on public.debate_comment_likes
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.debate_comments
    join public.debate_topics on debate_topics.id = debate_comments.topic_id
    join public.issues on issues.id = debate_topics.issue_id
    where debate_comments.id = debate_comment_likes.comment_id
      and issues.published_at is not null
      and issues.published_at <= now()
  )
);

drop policy if exists debate_comment_likes_delete_own on public.debate_comment_likes;
create policy debate_comment_likes_delete_own
on public.debate_comment_likes
for delete
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.debate_comments
    where debate_comments.id = debate_comment_likes.comment_id
      and debate_comments.user_id = auth.uid()
  )
);

drop policy if exists debate_comment_dislikes_public_select on public.debate_comment_dislikes;
create policy debate_comment_dislikes_public_select
on public.debate_comment_dislikes
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.debate_comments
    join public.debate_topics on debate_topics.id = debate_comments.topic_id
    join public.issues on issues.id = debate_topics.issue_id
    where debate_comments.id = debate_comment_dislikes.comment_id
      and issues.published_at is not null
      and issues.published_at <= now()
  )
);

drop policy if exists debate_comment_dislikes_insert_own on public.debate_comment_dislikes;
create policy debate_comment_dislikes_insert_own
on public.debate_comment_dislikes
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.debate_comments
    join public.debate_topics on debate_topics.id = debate_comments.topic_id
    join public.issues on issues.id = debate_topics.issue_id
    where debate_comments.id = debate_comment_dislikes.comment_id
      and issues.published_at is not null
      and issues.published_at <= now()
  )
);

drop policy if exists debate_comment_dislikes_delete_own on public.debate_comment_dislikes;
create policy debate_comment_dislikes_delete_own
on public.debate_comment_dislikes
for delete
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.debate_comments
    where debate_comments.id = debate_comment_dislikes.comment_id
      and debate_comments.user_id = auth.uid()
  )
);
