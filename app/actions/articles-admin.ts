'use server'

import { revalidatePath } from 'next/cache'
import { getAdminAccess } from '@/lib/admin-access'
import { CATEGORY_PATHS, normalizeCategory } from '@/lib/articles'
import { createAdminClient } from '@/lib/supabase/admin'

interface ActionResult<T = null> {
  success: boolean
  message: string
  data?: T
  error?: string
}

interface AdminIssueSummary {
  id: string
  coverImage: string | null
  isCurrent: boolean
  label: string
  publishedAt: string | null
  slug: string
  sortOrder: number
  title: string
}

interface AdminArticleSummary {
  author: string
  category: string
  id: string
  isPublished: boolean
  issueId: string | null
  issueLabel: string | null
  issueSlug: string | null
  publishedAt: string | null
  slug: string
  title: string
}

interface CreateArticleInput {
  author: string
  category: string
  content: string
  issueId: string
  publishNow: boolean
  slug: string
  title: string
}

type RawArticleRow = Record<string, unknown>
type RawIssueRow = Record<string, unknown>

const ISSUE_SELECT = `
  id,
  slug,
  label,
  title,
  is_current,
  sort_order,
  published_at
`

const ADMIN_ARTICLE_SELECT = `
  *,
  issue:issues!articles_issue_id_fkey(
    ${ISSUE_SELECT}
  )
`

function toText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return String(error)
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

function mapIssue(row: RawIssueRow): AdminIssueSummary {
  return {
    id: String(row.id ?? ''),
    slug: toText(row.slug),
    label: toText(row.label),
    title: toText(row.title),
    coverImage: toText(row.cover_image) || null,
    isCurrent: Boolean(row.is_current),
    sortOrder: Number(row.sort_order ?? 0),
    publishedAt: toText(row.published_at) || null,
  }
}

function mapAdminArticle(row: RawArticleRow): AdminArticleSummary {
  const issue = (row.issue as RawIssueRow | null | undefined) ?? null

  return {
    id: String(row.id ?? row.slug ?? ''),
    title: toText(row.title) || '未命名文章',
    slug: toText(row.slug),
    author: toText(row.author_name) || toText(row.author) || '匿名',
    category: normalizeCategory(
      toText(row.category) || toText(row.category_name) || toText(row.section) || '未分类'
    ),
    isPublished: Boolean(row.is_published),
    publishedAt: toText(row.published_at) || toText(row.created_at) || null,
    issueId: issue ? String(issue.id ?? '') : null,
    issueLabel: issue ? toText(issue.label) : null,
    issueSlug: issue ? toText(issue.slug) : null,
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

async function getIssueById(issueId: string) {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('issues')
    .select(ISSUE_SELECT)
    .eq('id', issueId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ? mapIssue(data as RawIssueRow) : null
}

export async function getAdminIssues(): Promise<ActionResult<AdminIssueSummary[]>> {
  try {
    const adminAccess = await requireArticleAdmin()
    if (!adminAccess.ok) {
      return adminAccess.result
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('issues')
      .select(ISSUE_SELECT)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      return {
        success: false,
        message: '获取刊号列表失败。',
        error: error.message,
      }
    }

    const issues = (data ?? [])
      .map((row) => mapIssue(row as RawIssueRow))
      .sort((left, right) => {
        if (left.isCurrent !== right.isCurrent) {
          return left.isCurrent ? -1 : 1
        }

        return left.sortOrder - right.sortOrder
      })

    return {
      success: true,
      message: '获取成功。',
      data: issues,
    }
  } catch (error) {
    console.error('[getAdminIssues] Unexpected error:', error)
    return {
      success: false,
      message: '获取刊号列表失败。',
      error: getErrorMessage(error),
    }
  }
}

export async function getAdminArticles(): Promise<ActionResult<AdminArticleSummary[]>> {
  try {
    const adminAccess = await requireArticleAdmin()
    if (!adminAccess.ok) {
      return adminAccess.result
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('articles')
      .select(ADMIN_ARTICLE_SELECT)
      .order('created_at', { ascending: false })
      .limit(10)

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
      error: getErrorMessage(error),
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
    const category = normalizeCategory(input.category.trim())
    const issueId = input.issueId.trim()
    const normalizedSlug = normalizeSlug(input.slug || input.title)

    if (!title || !author || !content || !category || !issueId) {
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

    const issue = await getIssueById(issueId)

    if (!issue) {
      return {
        success: false,
        message: '请选择有效的所属刊号。',
        error: 'INVALID_ISSUE',
      }
    }

    const uniqueSlug = await buildUniqueSlug(normalizedSlug)
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('articles')
      .insert({
        title,
        slug: uniqueSlug,
        content,
        author_name: author,
        category,
        is_published: input.publishNow,
        view_count: 0,
        issue_id: issue.id,
      })
      .select(ADMIN_ARTICLE_SELECT)
      .single()

    if (error || !data) {
      console.error('[createAdminArticle] Failed to insert article:', error)
      return {
        success: false,
        message: '保存文章失败，请检查 Supabase 文章表配置。',
        error: error?.message ?? 'INSERT_FAILED',
      }
    }

    revalidatePath('/ops-room')
    revalidatePath('/ops-room/articles')

    if (input.publishNow) {
      revalidatePath('/')
      revalidatePath('/issues')
      revalidatePath(`/issues/${issue.slug}`)
      revalidatePath(`/articles/${uniqueSlug}`)

      if (CATEGORY_PATHS[category]) {
        revalidatePath(CATEGORY_PATHS[category])
      }
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
      error: getErrorMessage(error),
    }
  }
}

export async function updateIssuePublishedAt(
  issueId: string,
  publishedAt: string | null
): Promise<ActionResult> {
  try {
    const adminAccess = await requireArticleAdmin()
    if (!adminAccess.ok) {
      return adminAccess.result
    }

    if (!issueId) {
      return {
        success: false,
        message: '缺少刊号 ID。',
        error: 'MISSING_ISSUE_ID',
      }
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('issues')
      .update({ published_at: publishedAt })
      .eq('id', issueId)

    if (error) {
      return {
        success: false,
        message: '更新上线时间失败。',
        error: error.message,
      }
    }

    revalidatePath('/')
    revalidatePath('/issues')
    revalidatePath('/ops-room')
    revalidatePath('/ops-room/articles')

    return {
      success: true,
      message: publishedAt ? `上线时间已设置为 ${publishedAt}` : '上线时间已清除。',
    }
  } catch (error) {
    console.error('[updateIssuePublishedAt] Unexpected error:', error)
    return {
      success: false,
      message: '更新上线时间失败。',
      error: getErrorMessage(error),
    }
  }
}

export async function uploadIssueCoverImage(
  issueId: string,
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  try {
    const adminAccess = await requireArticleAdmin()
    if (!adminAccess.ok) {
      return adminAccess.result
    }

    if (!issueId) {
      return {
        success: false,
        message: '缺少刊号 ID。',
        error: 'MISSING_ISSUE_ID',
      }
    }

    const file = formData.get('file') as File | null
    if (!file || file.size === 0) {
      return {
        success: false,
        message: '请选择一个图片文件。',
        error: 'NO_FILE',
      }
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `covers/${issueId}.${ext}`

    const adminClient = createAdminClient()

    // Upload to Supabase Storage (bucket: "issue-covers")
    const { error: uploadError } = await adminClient.storage
      .from('issue-covers')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('[uploadIssueCoverImage] Upload error:', uploadError)
      return {
        success: false,
        message: '上传封面图片失败。请确保 Supabase Storage 已创建名为 "issue-covers" 的公开 Bucket。',
        error: uploadError.message,
      }
    }

    // Get the public URL
    const { data: urlData } = adminClient.storage
      .from('issue-covers')
      .getPublicUrl(fileName)

    const publicUrl = urlData.publicUrl

    // Save URL to the issues table
    const { error: updateError } = await adminClient
      .from('issues')
      .update({ cover_image: publicUrl })
      .eq('id', issueId)

    if (updateError) {
      return {
        success: false,
        message: '图片已上传，但保存链接到数据库失败。',
        error: updateError.message,
      }
    }

    revalidatePath('/')
    revalidatePath('/issues')
    revalidatePath('/ops-room/articles')

    return {
      success: true,
      message: '封面图片上传成功！',
      data: { url: publicUrl },
    }
  } catch (error) {
    console.error('[uploadIssueCoverImage] Unexpected error:', error)
    return {
      success: false,
      message: '上传封面图片失败。',
      error: getErrorMessage(error),
    }
  }
}
