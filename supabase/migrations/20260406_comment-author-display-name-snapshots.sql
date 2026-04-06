-- 为回响与画里话外评论固化作者展示名快照，避免前台展示依赖 profiles 的公开读取权限

alter table public.echoes
  add column if not exists author_display_name text not null default '用户';

alter table public.issue_drawing_comments
  add column if not exists author_display_name text not null default '用户';

comment on column public.echoes.author_display_name is
  '作者展示名快照；匿名展示仍由 is_anonymous 控制。';

comment on column public.issue_drawing_comments.author_display_name is
  '作者展示名快照；匿名展示仍由 is_anonymous 控制。';

update public.echoes e
set author_display_name = coalesce(
  nullif(btrim(p.display_name), ''),
  nullif(btrim(u.raw_user_meta_data ->> 'display_name'), ''),
  nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
  '用户'
)
from auth.users u
left join public.profiles p
  on p.id = u.id
where u.id = e.user_id
  and btrim(coalesce(e.author_display_name, '')) in ('', '用户');

update public.issue_drawing_comments c
set author_display_name = coalesce(
  nullif(btrim(p.display_name), ''),
  nullif(btrim(u.raw_user_meta_data ->> 'display_name'), ''),
  nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
  '用户'
)
from auth.users u
left join public.profiles p
  on p.id = u.id
where u.id = c.user_id
  and btrim(coalesce(c.author_display_name, '')) in ('', '用户');
