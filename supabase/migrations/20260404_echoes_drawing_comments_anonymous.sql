-- 回响与画里话外留言支持匿名展示（仍存 user_id 便于后台审计）

alter table public.echoes
  add column if not exists is_anonymous boolean not null default false;

alter table public.issue_drawing_comments
  add column if not exists is_anonymous boolean not null default false;

comment on column public.echoes.is_anonymous is '为 true 时前台展示为匿名，不展示昵称';
comment on column public.issue_drawing_comments.is_anonymous is '为 true 时前台展示为匿名，不展示昵称';
