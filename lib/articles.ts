import "server-only";
import { createClient } from "@supabase/supabase-js";

export interface Issue {
  id: string;
  slug: string;
  label: string;
  title: string;
  coverImage: string | null;
  isCurrent: boolean;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string | null;
}

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
  issue: Issue | null;
}

export const CATEGORY_ORDER = [
  "有话慢谈",
  "人间剧场",
  "胡说八道",
  "三行两句",
  "见字如面",
] as const;

export const CATEGORY_PATHS: Record<string, string> = {
  有话慢谈: "/slow-talk",
  人间剧场: "/theater",
  胡说八道: "/nonsense",
  三行两句: "/poems",
  见字如面: "/letters",
};

type RawArticleRow = Record<string, unknown>;
type RawIssueRow = Record<string, unknown>;
type DatabaseClient = any;

const ISSUE_SELECT = `
  id,
  slug,
  label,
  title,
  cover_image,
  is_current,
  sort_order,
  published_at,
  created_at
`;

const ARTICLE_SELECT = `
  *,
  issue:issues!articles_issue_id_fkey(
    ${ISSUE_SELECT}
  )
`;

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

async function runWithAdminFallback<T>(
  queryFactory: (db: DatabaseClient) => Promise<{ data: T | null; error: unknown }>
) {
  const supabase = getSupabaseClient();
  const adminSupabase = getAdminSupabaseClient();
  const db = adminSupabase ?? supabase;

  if (!db) {
    return {
      data: null as T | null,
      error: new Error("Supabase client is not configured"),
    };
  }

  const result = await queryFactory(db);

  if ((!result.data || result.error) && supabase && adminSupabase && db !== supabase) {
    return queryFactory(supabase);
  }

  return result;
}

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function normalizeCategory(category: string): string {
  if (category === "有话漫谈") {
    return "有话慢谈";
  }

  return category;
}

function getCategoryAliases(category: string) {
  if (category === "有话慢谈" || category === "有话漫谈") {
    return ["有话慢谈", "有话漫谈"];
  }

  return [category];
}

export function getCategoryPath(category: string) {
  return CATEGORY_PATHS[normalizeCategory(category)] ?? "/";
}

export function getIssueHref(issue: Pick<Issue, "slug"> | null) {
  return issue ? `/issues/${issue.slug}` : "/issues";
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function createExcerpt(input: string) {
  const text = stripHtml(input);

  if (text.length <= 120) {
    return text;
  }

  return `${text.slice(0, 120).trim()}...`;
}

function mapIssue(row: RawIssueRow | null | undefined): Issue | null {
  if (!row) {
    return null;
  }

  return {
    id: String(row.id ?? ""),
    slug: toText(row.slug),
    label: toText(row.label),
    title: toText(row.title),
    coverImage: toText(row.cover_image) || null,
    isCurrent: Boolean(row.is_current),
    sortOrder: Number(row.sort_order ?? 0),
    publishedAt: toText(row.published_at) || null,
    createdAt: toText(row.created_at) || null,
  };
}

/**
 * Returns true if the issue's published_at date is in the past (or null/empty).
 * Issues with a future published_at are considered "scheduled" and hidden from the front-end.
 */
function isIssuePublished(issue: Issue | null): issue is Issue {
  if (!issue) return false;
  if (!issue.publishedAt) return true; // No date = always visible
  return new Date(issue.publishedAt) <= new Date();
}

function mapArticle(row: RawArticleRow): Article {
  const id = String(row.id ?? row.slug ?? "");
  const slug = toText(row.slug) || id;
  const content =
    toText(row.content_html) || toText(row.content) || toText(row.body) || "";
  const excerpt =
    toText(row.excerpt) || toText(row.summary) || createExcerpt(content);

  return {
    id,
    slug,
    title: toText(row.title) || "未命名文章",
    excerpt,
    content,
    author: toText(row.author_name) || toText(row.author) || "匿名",
    category: normalizeCategory(
      toText(row.category_name) || toText(row.category) || toText(row.section) || "未分类"
    ),
    publishedAt: toText(row.published_at) || toText(row.created_at) || new Date(0).toISOString(),
    viewCount: Number(row.view_count ?? 0),
    issue: mapIssue((row.issue as RawIssueRow | null | undefined) ?? null),
  };
}

export function groupArticlesByCategory(articles: Article[]): [string, Article[]][] {
  const groups = new Map<string, Article[]>();

  for (const article of articles) {
    const key = normalizeCategory(article.category);
    const items = groups.get(key) ?? [];
    items.push(article);
    groups.set(key, items);
  }

  return Array.from(groups.entries()).sort(([left], [right]) => {
    const leftIndex = CATEGORY_ORDER.indexOf(left as (typeof CATEGORY_ORDER)[number]);
    const rightIndex = CATEGORY_ORDER.indexOf(right as (typeof CATEGORY_ORDER)[number]);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.localeCompare(right, "zh-CN");
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });
}

export async function getAllIssues(): Promise<Issue[]> {
  const { data, error } = await runWithAdminFallback<RawIssueRow[]>((db) =>
    db
      .from("issues")
      .select(ISSUE_SELECT)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
  );

  if (error || !data) {
    console.error("[getAllIssues] 获取刊号列表失败:", error);
    return [];
  }

  return data
    .map((row) => mapIssue(row))
    .filter((issue): issue is Issue => isIssuePublished(issue))
    .sort((left, right) => {
      if (left.isCurrent !== right.isCurrent) {
        return left.isCurrent ? -1 : 1;
      }

      return left.sortOrder - right.sortOrder;
    });
}

export async function getArchivedIssues() {
  const issues = await getAllIssues();
  return issues.filter((issue) => !issue.isCurrent);
}

export async function getCurrentIssue(): Promise<Issue | null> {
  // Automatically determine the "current" issue: the one with the highest
  // sort_order whose published_at is in the past. No manual is_current needed.
  const issues = await getAllIssues(); // already filtered by isIssuePublished
  if (issues.length === 0) return null;

  // Sort by sort_order descending — the newest published issue wins
  const sorted = [...issues].sort((a, b) => b.sortOrder - a.sortOrder);
  return sorted[0];
}

export async function getIssueBySlug(slug: string): Promise<Issue | null> {
  const { data, error } = await runWithAdminFallback<RawIssueRow>((db) =>
    db.from("issues").select(ISSUE_SELECT).eq("slug", slug).maybeSingle()
  );

  if (error) {
    console.error("[getIssueBySlug] 获取刊号失败:", error);
    return null;
  }

  const issue = mapIssue(data);
  // Gate: don't expose issues that haven't reached their publish date
  if (!isIssuePublished(issue)) return null;
  return issue;
}

function resolveIssueIdOption(options?: { issueId?: string | null }) {
  if (!options || options.issueId === undefined) {
    return undefined;
  }

  return options.issueId;
}

export async function getLatestArticles(
  limit = 8,
  options?: { issueId?: string | null }
): Promise<Article[]> {
  const explicitIssueId = resolveIssueIdOption(options);
  const issueId = explicitIssueId === undefined ? (await getCurrentIssue())?.id ?? null : explicitIssueId;

  const { data, error } = await runWithAdminFallback<RawArticleRow[]>((db) => {
    let query = db
      .from("articles")
      .select(ARTICLE_SELECT)
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (issueId) {
      query = query.eq("issue_id", issueId);
    }

    return query;
  });

  if (error || !data) {
    console.error("[getLatestArticles] 获取文章失败:", error);
    return [];
  }

  return data.map(mapArticle);
}

export async function getArticlesByCategory(
  category: string,
  limit = 20,
  options?: { issueId?: string | null }
): Promise<Article[]> {
  const explicitIssueId = resolveIssueIdOption(options);
  const issueId = explicitIssueId === undefined ? (await getCurrentIssue())?.id ?? null : explicitIssueId;
  const aliases = getCategoryAliases(normalizeCategory(category));
  const orFilter = aliases
    .map((value) => `category.eq.${value.replaceAll(",", "\\,")}`)
    .join(",");

  const { data, error } = await runWithAdminFallback<RawArticleRow[]>((db) => {
    let query = db
      .from("articles")
      .select(ARTICLE_SELECT)
      .eq("is_published", true)
      .or(orFilter)
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (issueId) {
      query = query.eq("issue_id", issueId);
    }

    return query;
  });

  if (error) {
    console.error("[getArticlesByCategory] 按栏目获取文章失败:", error);
    return [];
  }

  return (data ?? []).map(mapArticle);
}

export async function getArticlesByIssue(issueId: string, limit = 100): Promise<Article[]> {
  if (!issueId) {
    return [];
  }

  const { data, error } = await runWithAdminFallback<RawArticleRow[]>((db) =>
    db
      .from("articles")
      .select(ARTICLE_SELECT)
      .eq("is_published", true)
      .eq("issue_id", issueId)
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit)
  );

  if (error || !data) {
    console.error("[getArticlesByIssue] 获取本期文章失败:", error);
    return [];
  }

  return data.map(mapArticle);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await runWithAdminFallback<RawArticleRow>((db) =>
    db
      .from("articles")
      .select(ARTICLE_SELECT)
      .eq("is_published", true)
      .eq("slug", slug)
      .maybeSingle()
  );

  if (error) {
    console.error("[getArticleBySlug] 获取文章失败:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return mapArticle(data);
}
