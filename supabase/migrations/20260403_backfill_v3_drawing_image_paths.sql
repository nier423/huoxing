-- Move V3 drawing image URLs onto issue-scoped paths so future issues
-- can publish new images without overwriting archived content.

with v3_drawing as (
  select d.id
  from public.issue_drawings d
  join public.issues i on i.id = d.issue_id
  where upper(regexp_replace(trim(coalesce(i.label, '')), '^v', 'V', 'i')) = 'V3'
)
update public.issue_drawing_images img
set image_url = regexp_replace(img.image_url, '^/drawing-gallery/', '/drawing-gallery/v3/')
from v3_drawing vd
where img.drawing_id = vd.id
  and img.image_url like '/drawing-gallery/%'
  and img.image_url not like '/drawing-gallery/v3/%';
