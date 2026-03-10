import { createClient } from "@supabase/supabase-js";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  publishedAt: string;
  viewCount: number;
}

type RawArticleRow = Record<string, unknown>;

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[articles] 缺少 Supabase 环境变量配置");
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

function getAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function mapArticle(row: RawArticleRow): Article {
  const id = String(row.id ?? row.slug ?? "");
  const slug = toText(row.slug) || id;
  const content =
    toText(row.content_html) || toText(row.content) || toText(row.body) || "";
  const excerpt =
    toText(row.excerpt) ||
    toText(row.summary) ||
    stripHtml(content).slice(0, 120);

  return {
    id,
    slug,
    title: toText(row.title) || "未命名文章",
    excerpt,
    content,
    author: toText(row.author_name) || toText(row.author) || "匿名",
    category:
      toText(row.category_name) ||
      toText(row.category) ||
      toText(row.section) ||
      "未分类",
    publishedAt:
      toText(row.published_at) ||
      toText(row.created_at) ||
      new Date(0).toISOString(),
    viewCount: Number(row.view_count ?? 0),
  };
}

export async function getLatestArticles(limit = 8): Promise<Article[]> {
  const supabase = getSupabaseClient();
  const adminSupabase = getAdminSupabaseClient();
  const db = supabase ?? adminSupabase;
  if (!db) {
    return [];
  }
  const { data, error } = await db
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (supabase && adminSupabase) {
      const retry = await adminSupabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (!retry.error && retry.data) {
        return (retry.data as RawArticleRow[]).map(mapArticle);
      }
    }
    console.error("[getLatestArticles] 获取文章失败:", error);
    return [];
  }

  return (data as RawArticleRow[]).map(mapArticle);
}

export async function getArticlesByCategory(
  category: string,
  limit = 20
): Promise<Article[]> {
  const supabase = getSupabaseClient();
  const adminSupabase = getAdminSupabaseClient();
  const db = supabase ?? adminSupabase;
  if (!db) {
    return [];
  }
  const categoryAliases =
    category === "有话漫谈"
      ? ["有话漫谈", "有话慢谈"]
      : category === "有话慢谈"
        ? ["有话慢谈", "有话漫谈"]
        : [category];
  const orFilter = categoryAliases
    .map((value) => `category.eq.${value.replaceAll(",", "\\,")}`)
    .join(",");
  const { data, error } = await db
    .from("articles")
    .select("*")
    .or(orFilter)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!error && data && data.length > 0) {
    return (data as RawArticleRow[]).map(mapArticle);
  }

  if ((error || !data || data.length === 0) && supabase && adminSupabase) {
    const retry = await adminSupabase
      .from("articles")
      .select("*")
      .or(orFilter)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (!retry.error && retry.data && retry.data.length > 0) {
      return (retry.data as RawArticleRow[]).map(mapArticle);
    }
  }

  if (error) {
    console.error("[getArticlesByCategory] 按分类获取文章失败:", error);
  }

  const fallback = await getLatestArticles(100);
  return fallback
    .filter((article) => categoryAliases.includes(article.category))
    .slice(0, limit);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = getSupabaseClient();
  const adminSupabase = getAdminSupabaseClient();
  const db = supabase ?? adminSupabase;
  if (!db) {
    return null;
  }
  const { data, error } = await db
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if ((error || !data) && supabase && adminSupabase) {
    const retry = await adminSupabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (!retry.error && retry.data) {
      return mapArticle(retry.data as RawArticleRow);
    }
  }

  if (error) {
    console.error("[getArticleBySlug] 获取文章失败:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return mapArticle(data as RawArticleRow);
}
