-- DB-backed content for the issue-level drawing section.
-- This migration:
-- 1. creates one drawing-content record per issue
-- 2. stores ordered drawing images in the database
-- 3. generalizes drawing comments from "V3 only" to "any published issue that has drawing content"
-- 4. backfills the current V3 hardcoded content so the existing page can be migrated safely

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.issue_drawings (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null unique references public.issues (id) on delete cascade,
  title text not null,
  author_name text,
  author_handle text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint issue_drawings_title_not_empty
    check (length(trim(title)) > 0),
  constraint issue_drawings_author_name_not_empty
    check (author_name is null or length(trim(author_name)) > 0),
  constraint issue_drawings_author_handle_not_empty
    check (author_handle is null or length(trim(author_handle)) > 0)
);

create index if not exists issue_drawings_issue_idx
  on public.issue_drawings (issue_id);

comment on table public.issue_drawings is
  'One drawing-section content record per published issue.';

drop trigger if exists set_issue_drawings_updated_at on public.issue_drawings;
create trigger set_issue_drawings_updated_at
before update on public.issue_drawings
for each row
execute function public.set_updated_at();

create table if not exists public.issue_drawing_images (
  id uuid primary key default gen_random_uuid(),
  drawing_id uuid not null references public.issue_drawings (id) on delete cascade,
  image_url text not null,
  alt_text text,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint issue_drawing_images_url_not_empty
    check (length(trim(image_url)) > 0),
  constraint issue_drawing_images_alt_text_not_empty
    check (alt_text is null or length(trim(alt_text)) > 0),
  constraint issue_drawing_images_caption_not_empty
    check (caption is null or length(trim(caption)) > 0),
  constraint issue_drawing_images_sort_order_non_negative
    check (sort_order >= 0),
  constraint issue_drawing_images_unique_order
    unique (drawing_id, sort_order)
);

create index if not exists issue_drawing_images_drawing_sort_idx
  on public.issue_drawing_images (drawing_id, sort_order asc);

comment on table public.issue_drawing_images is
  'Ordered image list for one issue drawing-section record.';

drop trigger if exists set_issue_drawing_images_updated_at on public.issue_drawing_images;
create trigger set_issue_drawing_images_updated_at
before update on public.issue_drawing_images
for each row
execute function public.set_updated_at();

create or replace function public.is_published_issue(p_issue_id uuid)
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
  );
$$;

create or replace function public.has_published_issue_drawing(p_issue_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.issue_drawings d
    join public.issues i on i.id = d.issue_id
    where d.issue_id = p_issue_id
      and i.published_at is not null
      and i.published_at <= now()
  );
$$;

alter table public.issue_drawings enable row level security;

drop policy if exists issue_drawings_public_select on public.issue_drawings;
create policy issue_drawings_public_select
on public.issue_drawings
for select
to anon, authenticated
using (public.is_published_issue(issue_id));

alter table public.issue_drawing_images enable row level security;

drop policy if exists issue_drawing_images_public_select on public.issue_drawing_images;
create policy issue_drawing_images_public_select
on public.issue_drawing_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.issue_drawings d
    where d.id = drawing_id
      and public.is_published_issue(d.issue_id)
  )
);

drop policy if exists issue_drawing_comments_public_select on public.issue_drawing_comments;
create policy issue_drawing_comments_public_select
on public.issue_drawing_comments
for select
to anon, authenticated
using (public.has_published_issue_drawing(issue_id));

drop policy if exists issue_drawing_comments_insert_own on public.issue_drawing_comments;
create policy issue_drawing_comments_insert_own
on public.issue_drawing_comments
for insert
to authenticated
with check (
  auth.uid() = user_id
  and public.has_published_issue_drawing(issue_id)
);

drop policy if exists issue_drawing_comments_delete_own on public.issue_drawing_comments;
create policy issue_drawing_comments_delete_own
on public.issue_drawing_comments
for delete
to authenticated
using (
  auth.uid() = user_id
  and public.has_published_issue_drawing(issue_id)
);

with target_issue as (
  select i.id
  from public.issues i
  where upper(regexp_replace(trim(coalesce(i.label, '')), '^v', 'V', 'i')) = 'V3'
  order by i.sort_order desc, i.created_at desc
  limit 1
),
upserted_drawing as (
  insert into public.issue_drawings (
    issue_id,
    title,
    author_name,
    author_handle,
    description
  )
  select
    ti.id,
    '月经六周年：只想感谢布洛芬和花掉的六千块',
    null,
    '我是鹿人甲',
    null
  from target_issue ti
  where not exists (
    select 1
    from public.issue_drawings d
    where d.issue_id = ti.id
  )
  returning id, issue_id
),
resolved_drawing as (
  select ud.id, ud.issue_id
  from upserted_drawing ud
  union all
  select d.id, d.issue_id
  from public.issue_drawings d
  join target_issue ti on ti.id = d.issue_id
),
seed_images(image_url, alt_text, sort_order) as (
  values
    ('/drawing-gallery/01.jpg', '画里有话 第1张', 0),
    ('/drawing-gallery/02.jpg', '画里有话 第2张', 1),
    ('/drawing-gallery/03.jpg', '画里有话 第3张', 2),
    ('/drawing-gallery/04.jpg', '画里有话 第4张', 3),
    ('/drawing-gallery/05.jpg', '画里有话 第5张', 4),
    ('/drawing-gallery/06.jpg', '画里有话 第6张', 5),
    ('/drawing-gallery/07.jpg', '画里有话 第7张', 6),
    ('/drawing-gallery/08.jpg', '画里有话 第8张', 7),
    ('/drawing-gallery/09.jpg', '画里有话 第9张', 8),
    ('/drawing-gallery/10.jpg', '画里有话 第10张', 9),
    ('/drawing-gallery/11.jpg', '画里有话 第11张', 10)
)
insert into public.issue_drawing_images (
  drawing_id,
  image_url,
  alt_text,
  sort_order
)
select
  rd.id,
  si.image_url,
  si.alt_text,
  si.sort_order
from resolved_drawing rd
cross join seed_images si
where not exists (
  select 1
  from public.issue_drawing_images img
  where img.drawing_id = rd.id
    and img.sort_order = si.sort_order
);
