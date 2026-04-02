-- Migration: allow one debate topic to be visible in multiple issues
--
-- Existing topics keep their original owner issue in debate_topics.issue_id,
-- while visibility moves to the join table below so one discussion can span
-- multiple issues without duplicating comments.

create table if not exists public.debate_topic_issue_links (
  debate_topic_id uuid not null references public.debate_topics(id) on delete cascade,
  issue_id uuid not null references public.issues(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (debate_topic_id, issue_id)
);

create index if not exists debate_topic_issue_links_issue_id_idx
  on public.debate_topic_issue_links (issue_id, debate_topic_id);

create index if not exists debate_topic_issue_links_topic_id_idx
  on public.debate_topic_issue_links (debate_topic_id, issue_id);

insert into public.debate_topic_issue_links (debate_topic_id, issue_id)
select id, issue_id
from public.debate_topics
where issue_id is not null
on conflict (debate_topic_id, issue_id) do nothing;

alter table public.debate_topic_issue_links enable row level security;

drop policy if exists debate_topic_issue_links_public_select on public.debate_topic_issue_links;
create policy debate_topic_issue_links_public_select
on public.debate_topic_issue_links
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.issues
    where issues.id = debate_topic_issue_links.issue_id
      and issues.published_at is not null
      and issues.published_at <= now()
  )
);

drop policy if exists debate_topics_public_select on public.debate_topics;
create policy debate_topics_public_select
on public.debate_topics
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.debate_topic_issue_links
    join public.issues on issues.id = debate_topic_issue_links.issue_id
    where debate_topic_issue_links.debate_topic_id = debate_topics.id
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
    from public.debate_topic_issue_links
    join public.issues on issues.id = debate_topic_issue_links.issue_id
    where debate_topic_issue_links.debate_topic_id = debate_comments.topic_id
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
    join public.debate_topic_issue_links
      on debate_topic_issue_links.debate_topic_id = debate_topics.id
    join public.issues
      on issues.id = debate_topic_issue_links.issue_id
    where debate_topics.id = debate_comments.topic_id
      and issues.published_at is not null
      and issues.published_at <= now()
      and debate_topics.starts_at is not null
      and debate_topics.ends_at is not null
      and debate_topics.starts_at <= now()
      and debate_topics.ends_at > now()
  )
);

drop policy if exists debate_comment_likes_public_select on public.debate_comment_likes;
create policy debate_comment_likes_public_select
on public.debate_comment_likes
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.debate_comments
    join public.debate_topic_issue_links
      on debate_topic_issue_links.debate_topic_id = debate_comments.topic_id
    join public.issues
      on issues.id = debate_topic_issue_links.issue_id
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
    join public.debate_topic_issue_links
      on debate_topic_issue_links.debate_topic_id = debate_comments.topic_id
    join public.issues
      on issues.id = debate_topic_issue_links.issue_id
    where debate_comments.id = debate_comment_likes.comment_id
      and issues.published_at is not null
      and issues.published_at <= now()
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
    join public.debate_topic_issue_links
      on debate_topic_issue_links.debate_topic_id = debate_comments.topic_id
    join public.issues
      on issues.id = debate_topic_issue_links.issue_id
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
    join public.debate_topic_issue_links
      on debate_topic_issue_links.debate_topic_id = debate_comments.topic_id
    join public.issues
      on issues.id = debate_topic_issue_links.issue_id
    where debate_comments.id = debate_comment_dislikes.comment_id
      and issues.published_at is not null
      and issues.published_at <= now()
  )
);
