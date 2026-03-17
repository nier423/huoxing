'use server'

import { revalidatePath } from 'next/cache'
import { getAdminAccess } from '@/lib/admin-access'
import { createAdminClient } from '@/lib/supabase/admin'

interface ActionResult<T = null> {
  success: boolean
  message: string
  data?: T
  error?: string
}

interface AdminArticleSummary {
  author: string
  category: string
  id: string
  isPublished: boolean
  publishedAt: string | null
  slug: string
  title: string
}

interface CreateArticleInput {
  author: string
  category: string
  content: string
  publishNow: boolean
  slug: string
  title: string
}

type RawArticleRow = Record<string, unknown>

const CATEGORY_PATHS: Record<string, string> = {
  有话慢谈: '/slow-talk',
  人间剧场: '/theater',
  胡说八道: '/nonsense',
  三行两句: '/poems',
  见字如面: '/letters',
}

function toText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function normalizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fff-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function requireArticleAdmin(): Promise<
  | { ok: true; userId: string }
  | {
      ok: false
      result: {
        success: false
        message: string
        error: string
      }
    }
> {
  const access = await getAdminAccess()

  if (access.error === 'NOT_AUTHENTICATED') {
    return {
      ok: false,
      result: {
        success: false,
        message: '请先登录。',
        error: 'NOT_AUTHENTICATED',
      },
    }
  }

  if (access.error) {
    return {
      ok: false,
      result: {
        success: false,
        message: '管理员身份校验失败。',
        error: access.error,
      },
    }
  }

  if (!access.isAdmin || !access.user) {
    return {
      ok: false,
      result: {
        success: false,
        message: '无权访问文章管理。',
        error: 'UNAUTHORIZED',
      },
    }
  }

  return {
    ok: true,
    userId: access.user.id,
  }
}

function mapAdminArticle(row: RawArticleRow): AdminArticleSummary {
  return {
    id: String(row.id ?? row.slug ?? ''),
    title: toText(row.title) || '未命名文章',
    slug: toText(row.slug),
    author: toText(row.author_name) || toText(row.author) || '匿名',
    category: toText(row.category) || toText(row.category_name) || toText(row.section),
    isPublished: Boolean(row.is_published),
    publishedAt: toText(row.published_at) || toText(row.created_at) || null,
  }
}

async function buildUniqueSlug(baseSlug: string) {
  const adminClient = createAdminClient()
  const slugRoot = baseSlug || `article-${Date.now()}`
  let candidate = slugRoot
  let suffix = 1

  while (true) {
    const { data, error } = await adminClient
      .from('articles')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      return candidate
    }

    suffix += 1
    candidate = `${slugRoot}-${suffix}`
  }
}

async function insertArticle(payload: {
  author: string
  category: string
  content: string
  isPublished: boolean
  slug: string
  title: string
}) {
  const adminClient = createAdminClient()
  return adminClient
    .from('articles')
    .insert({
      title: payload.title,
      slug: payload.slug,
      content: payload.content,
      author_name: payload.author,
      category: payload.category,
      is_published: payload.isPublished,
      view_count: 0,
    })
    .select('*')
    .single()
}

export async function getAdminArticles(): Promise<
  ActionResult<AdminArticleSummary[]>
> {
  try {
    const adminAccess = await requireArticleAdmin()
    if (!adminAccess.ok) {
      return adminAccess.result
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) {
      return {
        success: false,
        message: '获取文章列表失败。',
        error: error.message,
      }
    }

    return {
      success: true,
      message: '获取成功。',
      data: (data ?? []).map((row) => mapAdminArticle(row as RawArticleRow)),
    }
  } catch (error) {
    console.error('[getAdminArticles] Unexpected error:', error)
    return {
      success: false,
      message: '获取文章列表失败。',
      error: String(error),
    }
  }
}

export async function createAdminArticle(
  input: CreateArticleInput
): Promise<ActionResult<AdminArticleSummary>> {
  try {
    const adminAccess = await requireArticleAdmin()
    if (!adminAccess.ok) {
      return adminAccess.result
    }

    const title = input.title.trim()
    const author = input.author.trim()
    const content = input.content.trim()
    const category = input.category.trim()
    const normalizedSlug = normalizeSlug(input.slug || input.title)

    if (!title || !author || !content || !category) {
      return {
        success: false,
        message: '请填写所有必填字段。',
        error: 'MISSING_FIELDS',
      }
    }

    if (!normalizedSlug) {
      return {
        success: false,
        message: '请填写有效的文章链接。',
        error: 'INVALID_SLUG',
      }
    }

    const uniqueSlug = await buildUniqueSlug(normalizedSlug)
    const { data, error } = await insertArticle({
      title,
      slug: uniqueSlug,
      content,
      author,
      category,
      isPublished: input.publishNow,
    })

    if (error || !data) {
      console.error('[createAdminArticle] Failed to insert article:', error)
      return {
        success: false,
        message: '保存文章失败，请检查 Supabase 文章表字段配置。',
        error: error?.message ?? 'INSERT_FAILED',
      }
    }

    revalidatePath('/')
    revalidatePath('/ops-room')
    revalidatePath('/ops-room/articles')
    revalidatePath(`/articles/${uniqueSlug}`)

    if (CATEGORY_PATHS[category]) {
      revalidatePath(CATEGORY_PATHS[category])
    }

    return {
      success: true,
      message: input.publishNow ? '文章已发布。' : '草稿已保存。',
      data: mapAdminArticle(data as RawArticleRow),
    }
  } catch (error) {
    console.error('[createAdminArticle] Unexpected error:', error)
    return {
      success: false,
      message: '保存文章失败。',
      error: String(error),
    }
  }
}
