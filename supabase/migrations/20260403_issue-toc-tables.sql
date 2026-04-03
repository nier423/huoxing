-- ============================================================
-- Migration: issue_toc_sections + issue_toc_items
-- Purpose:   Store per-issue table of contents data
-- ============================================================

-- 1. Sections table (栏目)
CREATE TABLE IF NOT EXISTS issue_toc_sections (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id    uuid NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    display_name text NOT NULL,
    sort_order  integer NOT NULL DEFAULT 0,
    is_standalone boolean NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_issue_toc_sections_issue
    ON issue_toc_sections (issue_id, sort_order);

ALTER TABLE issue_toc_sections ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can read sections of published issues
CREATE POLICY "issue_toc_sections: public read"
    ON issue_toc_sections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM issues
            WHERE issues.id = issue_toc_sections.issue_id
              AND issues.published_at IS NOT NULL
              AND issues.published_at <= now()
        )
    );

-- 2. Items table (文章条目)
CREATE TABLE IF NOT EXISTS issue_toc_items (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id  uuid NOT NULL REFERENCES issue_toc_sections(id) ON DELETE CASCADE,
    title       text NOT NULL,
    author      text NOT NULL DEFAULT '',
    sort_order  integer NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_issue_toc_items_section
    ON issue_toc_items (section_id, sort_order);

ALTER TABLE issue_toc_items ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can read items whose parent section is visible
CREATE POLICY "issue_toc_items: public read"
    ON issue_toc_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM issue_toc_sections s
            JOIN issues i ON i.id = s.issue_id
            WHERE s.id = issue_toc_items.section_id
              AND i.published_at IS NOT NULL
              AND i.published_at <= now()
        )
    );


-- ============================================================
-- Seed data: 第三看 (third issue) TOC
-- Uses a DO block to look up the issue and insert data.
-- Adjust the WHERE clause if your third issue has a different
-- slug or sort_order.
-- ============================================================
DO $$
DECLARE
    v_issue_id  uuid;
    v_sec_id    uuid;
BEGIN
    -- Find the third issue by sort_order.
    -- If your third issue uses a different identifier, change this query.
    SELECT id INTO v_issue_id
      FROM issues
     ORDER BY sort_order ASC
     OFFSET 2 LIMIT 1;

    IF v_issue_id IS NULL THEN
        RAISE NOTICE 'Third issue not found – skipping TOC seed data.';
        RETURN;
    END IF;

    -- ── 人间剧场-小说 ──────────────────────────────────────
    INSERT INTO issue_toc_sections (issue_id, display_name, sort_order, is_standalone)
    VALUES (v_issue_id, '人间剧场-小说', 1, false)
    RETURNING id INTO v_sec_id;

    INSERT INTO issue_toc_items (section_id, title, author, sort_order) VALUES
        (v_sec_id, '12岁的源静香，完成了一则浴室杀人案', '发着呆过了一下午', 1),
        (v_sec_id, '女人和母狗并没有什么不同', '母狮', 2),
        (v_sec_id, '班主任——月经篇', '南山暖玉', 3),
        (v_sec_id, '杀死那头大象', 'MOF-808', 4),
        (v_sec_id, '熬夜是会撞神的', '陌上花开', 5);

    -- ── 有话慢谈-随笔 ──────────────────────────────────────
    INSERT INTO issue_toc_sections (issue_id, display_name, sort_order, is_standalone)
    VALUES (v_issue_id, '有话慢谈-随笔', 2, false)
    RETURNING id INTO v_sec_id;

    INSERT INTO issue_toc_items (section_id, title, author, sort_order) VALUES
        (v_sec_id, '女孩，你不必为月经羞耻', '游年', 1),
        (v_sec_id, '我和月经的故事', '不午休也不困', 2),
        (v_sec_id, '第二十八日：我的裤子，和国旗一样鲜红', 'Cee养花养草中', 3),
        (v_sec_id, '我的小腹中有一只红鸟', '风子', 4);

    -- ── 胡说八道-杂谈 ──────────────────────────────────────
    INSERT INTO issue_toc_sections (issue_id, display_name, sort_order, is_standalone)
    VALUES (v_issue_id, '胡说八道-杂谈', 3, false)
    RETURNING id INTO v_sec_id;

    INSERT INTO issue_toc_items (section_id, title, author, sort_order) VALUES
        (v_sec_id, '我的月经是蓝色的', '特离谱', 1),
        (v_sec_id, '我想抛弃我的子宫和子宫里的孩子', 'Memoria', 2),
        (v_sec_id, '欢呼吧，来月经的女人', '田大三儿', 3),
        (v_sec_id, '与潮汐共振的 是我生命的脉搏', 'Q弹蟑螂', 4),
        (v_sec_id, '传闻中的母系氏族', '戏鱼', 5);

    -- ── 三行两句-诗歌 ──────────────────────────────────────
    INSERT INTO issue_toc_sections (issue_id, display_name, sort_order, is_standalone)
    VALUES (v_issue_id, '三行两句-诗歌', 4, false)
    RETURNING id INTO v_sec_id;

    INSERT INTO issue_toc_items (section_id, title, author, sort_order) VALUES
        (v_sec_id, '记月经——他人的毒药是我的魔药', '古古', 1),
        (v_sec_id, '再见月亮', 'MOF-808', 2),
        (v_sec_id, '我的身体', '贾无从', 3),
        (v_sec_id, '我与月亮有无数次约会', 'MOF-808', 4),
        (v_sec_id, '新血，黑血，我的河', '殊和', 5),
        (v_sec_id, '关于月经', '豆沙解', 6),
        (v_sec_id, '旧伤', '母狮', 7);

    -- ── 见字如面-书信 ──────────────────────────────────────
    INSERT INTO issue_toc_sections (issue_id, display_name, sort_order, is_standalone)
    VALUES (v_issue_id, '见字如面-书信', 5, false)
    RETURNING id INTO v_sec_id;

    INSERT INTO issue_toc_items (section_id, title, author, sort_order) VALUES
        (v_sec_id, '送给女孩们的信', 'Amanda', 1);

    -- ── 画里有话-漫画 ──────────────────────────────────────
    INSERT INTO issue_toc_sections (issue_id, display_name, sort_order, is_standalone)
    VALUES (v_issue_id, '画里有话-漫画', 6, false)
    RETURNING id INTO v_sec_id;

    INSERT INTO issue_toc_items (section_id, title, author, sort_order) VALUES
        (v_sec_id, '月经六周年：只想感谢布洛芬和花掉的六千块', '我是鹿人甲', 1);

    -- ── 以辩会友：月经相关辩题（独立栏目）─────────────────
    INSERT INTO issue_toc_sections (issue_id, display_name, sort_order, is_standalone)
    VALUES (v_issue_id, '以辩会友：月经相关辩题', 7, true);

    RAISE NOTICE 'TOC seed data for third issue inserted successfully.';
END $$;
