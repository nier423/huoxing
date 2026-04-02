'use server'

import { revalidatePath } from 'next/cache'
import { getAdminAccess } from '@/lib/admin-access'
import { CATEGORY_PATHS, normalizeCategory } from '@/lib/articles'
import { normalizeIssueLabel } from '@/lib/issue-display'
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

interface GetAdminArticlesInput {
  category?: string
  issueId?: string
}

type RawArticleRow = Record<string, unknown>
type RawIssueRow = Record<string, unknown>
type RawDebateRow = Record<string, unknown>

const ISSUE_SELECT = `
  id,
  slug,
  label,
  title,
  cover_image,
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

function getCategoryAliases(category: string) {
  if (category === '有话慢谈' || category === '有话漫谈') {
    return ['有话慢谈', '有话漫谈']
  }

  return [category]
}

function isIssueAlreadyPublished(publishedAt: string | null) {
  if (!publishedAt) {
    return false
  }

  const publishedMs = new Date(publishedAt).getTime()
  return !Number.isNaN(publishedMs) && publishedMs <= Date.now()
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

async function revalidateArticlePaths(article: RawArticleRow | null) {
  revalidatePath('/')
  revalidatePath('/issues')
  revalidatePath('/ops-room')
  revalidatePath('/ops-room/articles')

  const category = normalizeCategory(toText(article?.category))
  const categoryPath = CATEGORY_PATHS[category]

  if (categoryPath) {
    revalidatePath(categoryPath)
  }

  const slug = toText(article?.slug)
  if (slug) {
    revalidatePath(`/articles/${slug}`)
  }

  const issueId = toText(article?.issue_id)
  if (issueId) {
    const issue = await getIssueById(issueId)
    if (issue?.slug) {
      revalidatePath(`/issues/${issue.slug}`)
    }
  }
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

interface CreateIssueInput {
  label: string
  title: string
  slug: string
}

export async function createAdminIssue(
  input: CreateIssueInput
): Promise<ActionResult<AdminIssueSummary>> {
  try {
    const adminAccess = await requireArticleAdmin()
    if (!adminAccess.ok) {
      return adminAccess.result
    }

    const label = normalizeIssueLabel(input.label)
    const title = input.title.trim()
    const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')

    if (!label || !title || !slug) {
      return {
        success: false,
        message: '请填写所有必填字段（标签、标题、链接）。',
        error: 'MISSING_FIELDS',
      }
    }

    const adminClient = createAdminClient()

    // Check for duplicate slug
    const { data: existing } = await adminClient
      .from('issues')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      return {
        success: false,
        message: `链接 "${slug}" 已被占用，请换一个。`,
        error: 'DUPLICATE_SLUG',
      }
    }

    // Calculate next sort_order atomically from DB
    const { data: maxRow } = await adminClient
      .from('issues')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextSortOrder = (maxRow ? Number(maxRow.sort_order ?? 0) : 0) + 1

    const { data, error } = await adminClient
      .from('issues')
      .insert({
        label,
        title,
        slug,
        sort_order: nextSortOrder,
        is_current: false,
        published_at: null,
      })
      .select(ISSUE_SELECT)
      .single()

    if (error || !data) {
      console.error('[createAdminIssue] Failed to insert issue:', error)
      return {
        success: false,
        message: '创建期刊失败，请检查数据库配置。',
        error: error?.message ?? 'INSERT_FAILED',
      }
    }

    revalidatePath('/')
    revalidatePath('/issues')
    revalidatePath('/ops-room')
    revalidatePath('/ops-room/articles')

    return {
      success: true,
      message: `期刊 "${label} · ${title}" 已创建。`,
      data: mapIssue(data as RawIssueRow),
    }
  } catch (error) {
    console.error('[createAdminIssue] Unexpected error:', error)
    return {
      success: false,
      message: '创建期刊失败。',
      error: getErrorMessage(error),
    }
  }
}

export async function deleteAdminIssue(
  issueId: string
): Promise<ActionResult<{ deletedArticleCount: number; deletedDebateTopicCount: number }>> {
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
    const [issueResult, latestIssueResult] = await Promise.all([
      adminClient
        .from('issues')
        .select('id, slug, label, title, published_at, sort_order, created_at')
        .eq('id', issueId)
        .maybeSingle(),
      adminClient
        .from('issues')
        .select('id, slug, label, title, published_at, sort_order, created_at')
        .order('sort_order', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    if (issueResult.error) {
      return {
        success: false,
        message: '读取期刊信息失败。',
        error: issueResult.error.message,
      }
    }

    if (!issueResult.data) {
      return {
        success: false,
        message: '未找到要删除的期刊。',
        error: 'ISSUE_NOT_FOUND',
      }
    }

    if (latestIssueResult.error) {
      return {
        success: false,
        message: '读取最新期刊失败。',
        error: latestIssueResult.error.message,
      }
    }

    const issue = issueResult.data as RawIssueRow
    const latestIssue = (latestIssueResult.data as RawIssueRow | null) ?? null

    if (!latestIssue || String(latestIssue.id ?? '') !== issueId) {
      return {
        success: false,
        message: '只能删除最新创建的一期刊物。',
        error: 'ONLY_LATEST_ISSUE_CAN_BE_DELETED',
      }
    }

    const publishedAt = toText(issue.published_at) || null
    if (isIssueAlreadyPublished(publishedAt)) {
      return {
        success: false,
        message: '已经发布上线的期刊不能删除。',
        error: 'ISSUE_ALREADY_PUBLISHED',
      }
    }

    const [{ data: articleRows, error: articleFetchError }, { data: debateTopicRows, error: debateFetchError }] =
      await Promise.all([
        adminClient.from('articles').select('id').eq('issue_id', issueId),
        adminClient.from('debate_topics').select('id').eq('issue_id', issueId),
      ])

    if (articleFetchError) {
      return {
        success: false,
        message: '读取该期文章失败。',
        error: articleFetchError.message,
      }
    }

    if (debateFetchError) {
      return {
        success: false,
        message: '读取该期辩题失败。',
        error: debateFetchError.message,
      }
    }

    const articleIds = ((articleRows as RawArticleRow[] | null) ?? [])
      .map((row) => String(row.id ?? ''))
      .filter(Boolean)
    const debateTopicIds = ((debateTopicRows as RawDebateRow[] | null) ?? [])
      .map((row) => String(row.id ?? ''))
      .filter(Boolean)

    if (debateTopicIds.length > 0) {
      const { data: debateCommentRows, error: debateCommentFetchError } = await adminClient
        .from('debate_comments')
        .select('id')
        .in('topic_id', debateTopicIds)

      if (debateCommentFetchError) {
        return {
          success: false,
          message: '读取辩题评论失败。',
          error: debateCommentFetchError.message,
        }
      }

      const debateCommentIds = ((debateCommentRows as RawDebateRow[] | null) ?? [])
        .map((row) => String(row.id ?? ''))
        .filter(Boolean)

      if (debateCommentIds.length > 0) {
        const [deleteLikesResult, deleteDislikesResult, deleteCommentsResult] = await Promise.all([
          adminClient.from('debate_comment_likes').delete().in('comment_id', debateCommentIds),
          adminClient.from('debate_comment_dislikes').delete().in('comment_id', debateCommentIds),
          adminClient.from('debate_comments').delete().in('id', debateCommentIds),
        ])

        const debateChildDeleteError =
          deleteLikesResult.error ?? deleteDislikesResult.error ?? deleteCommentsResult.error

        if (debateChildDeleteError) {
          return {
            success: false,
            message: '删除辩题互动数据失败。',
            error: debateChildDeleteError.message,
          }
        }
      }

      const { error: deleteTopicsError } = await adminClient
        .from('debate_topics')
        .delete()
        .in('id', debateTopicIds)

      if (deleteTopicsError) {
        return {
          success: false,
          message: '删除辩题失败。',
          error: deleteTopicsError.message,
        }
      }
    }

    if (articleIds.length > 0) {
      const { error: deleteEchoesError } = await adminClient
        .from('echoes')
        .delete()
        .in('article_id', articleIds)

      if (deleteEchoesError) {
        return {
          success: false,
          message: '删除文章回响失败。',
          error: deleteEchoesError.message,
        }
      }

      const { error: deleteArticlesError } = await adminClient
        .from('articles')
        .delete()
        .eq('issue_id', issueId)

      if (deleteArticlesError) {
        return {
          success: false,
          message: '删除该期文章失败。',
          error: deleteArticlesError.message,
        }
      }
    }

    const { error: deleteIssueError } = await adminClient
      .from('issues')
      .delete()
      .eq('id', issueId)

    if (deleteIssueError) {
      return {
        success: false,
        message: '删除期刊失败。',
        error: deleteIssueError.message,
      }
    }

    revalidatePath('/')
    revalidatePath('/issues')
    revalidatePath('/ops-room')
    revalidatePath('/ops-room/articles')

    return {
      success: true,
      message: `期刊 "${toText(issue.label)} · ${toText(issue.title)}" 已删除。`,
      data: {
        deletedArticleCount: articleIds.length,
        deletedDebateTopicCount: debateTopicIds.length,
      },
    }
  } catch (error) {
    console.error('[deleteAdminIssue] Unexpected error:', error)
    return {
      success: false,
      message: '删除期刊失败。',
      error: getErrorMessage(error),
    }
  }
}

export async function getAdminArticles(
  input?: GetAdminArticlesInput
): Promise<ActionResult<AdminArticleSummary[]>> {
  try {
    const adminAccess = await requireArticleAdmin()
    if (!adminAccess.ok) {
      return adminAccess.result
    }

    const issueId = input?.issueId?.trim()
    const category = input?.category?.trim()
    const adminClient = createAdminClient()
    let query = adminClient
      .from('articles')
      .select(ADMIN_ARTICLE_SELECT)
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false })

    if (issueId) {
      query = query.eq('issue_id', issueId)
    }

    if (category) {
      const aliases = getCategoryAliases(normalizeCategory(category))
      query = aliases.length === 1 ? query.eq('category', aliases[0]) : query.in('category', aliases)
    }

    const { data, error } = await query

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
        published_at: input.publishNow ? new Date().toISOString() : null,
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

export async function updateArticlePublishedAt(
  articleId: string,
  publishedAt: string | null
): Promise<ActionResult> {
  try {
    const adminAccess = await requireArticleAdmin()
    if (!adminAccess.ok) {
      return adminAccess.result
    }

    if (!articleId) {
      return {
        success: false,
        message: '缺少文章 ID。',
        error: 'MISSING_ARTICLE_ID',
      }
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('articles')
      .update({ published_at: publishedAt })
      .eq('id', articleId)
      .select('slug, category, issue_id')
      .single()

    if (error) {
      return {
        success: false,
        message: '更新文章时间失败。',
        error: error.message,
      }
    }

    await revalidateArticlePaths((data as RawArticleRow | null) ?? null)

    return {
      success: true,
      message: publishedAt ? `文章时间已设定。` : '文章时间已清除。',
    }
  } catch (error) {
    console.error('[updateArticlePublishedAt] Unexpected error:', error)
    return {
      success: false,
      message: '更新文章时间失败。',
      error: getErrorMessage(error),
    }
  }
}

export async function replaceAdminArticle(
  sourceArticleId: string,
  targetArticleId: string
): Promise<ActionResult> {
  try {
    const adminAccess = await requireArticleAdmin()
    if (!adminAccess.ok) {
      return adminAccess.result
    }

    if (!sourceArticleId || !targetArticleId) {
      return {
        success: false,
        message: 'Missing article ID.',
        error: 'MISSING_ARTICLE_ID',
      }
    }

    if (sourceArticleId === targetArticleId) {
      return {
        success: false,
        message: 'Source and target articles must be different.',
        error: 'INVALID_ARTICLE_PAIR',
      }
    }

    const adminClient = createAdminClient()
    const { data: articles, error: fetchError } = await adminClient
      .from('articles')
      .select('id, slug, category, issue_id, published_at, is_published')
      .in('id', [sourceArticleId, targetArticleId])

    if (fetchError) {
      return {
        success: false,
        message: 'Failed to load articles for replacement.',
        error: fetchError.message,
      }
    }

    const rows = (articles as RawArticleRow[] | null) ?? []
    const sourceArticle =
      rows.find((row) => String(row.id ?? '') === sourceArticleId) ?? null
    const targetArticle =
      rows.find((row) => String(row.id ?? '') === targetArticleId) ?? null

    if (!sourceArticle || !targetArticle) {
      return {
        success: false,
        message: 'Could not find both articles for replacement.',
        error: 'ARTICLE_NOT_FOUND',
      }
    }

    const sourcePublishedAt = toText(sourceArticle.published_at) || null
    const targetPublishedAt = toText(targetArticle.published_at) || null
    const targetIsPublished = Boolean(targetArticle.is_published)

    if (!sourcePublishedAt) {
      return {
        success: false,
        message: 'The old article does not have a publish time yet.',
        error: 'MISSING_SOURCE_PUBLISHED_AT',
      }
    }

    if (!targetIsPublished) {
      return {
        success: false,
        message: 'Publish the new article before replacing the old one.',
        error: 'TARGET_NOT_PUBLISHED',
      }
    }

    const { data: updatedTarget, error: updateError } = await adminClient
      .from('articles')
      .update({ published_at: sourcePublishedAt })
      .eq('id', targetArticleId)
      .select('slug, category, issue_id, published_at')
      .single()

    if (updateError) {
      return {
        success: false,
        message: 'Failed to move the old publish time to the new article.',
        error: updateError.message,
      }
    }

    const { data: deletedSource, error: deleteError } = await adminClient
      .from('articles')
      .delete()
      .eq('id', sourceArticleId)
      .select('slug, category, issue_id, published_at')
      .single()

    if (deleteError) {
      const rollback = await adminClient
        .from('articles')
        .update({ published_at: targetPublishedAt })
        .eq('id', targetArticleId)

      if (rollback.error) {
        console.error('[replaceAdminArticle] Failed to roll back target article:', rollback.error)
      }

      return {
        success: false,
        message: 'Failed to delete the old article after moving its publish time.',
        error: deleteError.message,
      }
    }

    await revalidateArticlePaths((updatedTarget as RawArticleRow | null) ?? null)
    await revalidateArticlePaths((deletedSource as RawArticleRow | null) ?? null)

    return {
      success: true,
      message: 'Article replaced successfully.',
    }
  } catch (error) {
    console.error('[replaceAdminArticle] Unexpected error:', error)
    return {
      success: false,
      message: 'Failed to replace the article.',
      error: getErrorMessage(error),
    }
  }
}

export async function deleteAdminArticle(articleId: string): Promise<ActionResult> {
  try {
    const adminAccess = await requireArticleAdmin()
    if (!adminAccess.ok) {
      return adminAccess.result
    }

    if (!articleId) {
      return {
        success: false,
        message: 'Missing article ID.',
        error: 'MISSING_ARTICLE_ID',
      }
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('articles')
      .delete()
      .eq('id', articleId)
      .select('slug, category, issue_id')
      .single()

    if (error) {
      return {
        success: false,
        message: 'Failed to delete article.',
        error: error.message,
      }
    }

    await revalidateArticlePaths((data as RawArticleRow | null) ?? null)

    return {
      success: true,
      message: 'Article deleted.',
    }
  } catch (error) {
    console.error('[deleteAdminArticle] Unexpected error:', error)
    return {
      success: false,
      message: 'Failed to delete article.',
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
