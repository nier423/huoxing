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

export interface AdminDebateTopicSummary {
  id: string
  issueId: string
  linkedIssueIds: string[]
  title: string
  description: string | null
  sortOrder: number
  startsAt: string | null
  endsAt: string | null
  createdAt: string
}

interface CreateAdminDebateTopicInput {
  issueIds: string[]
  title: string
  startsAt?: string | null
  endsAt?: string | null
}

interface UpdateAdminDebateTopicInput {
  topicId: string
  issueIds: string[]
  title: string
  startsAt?: string | null
  endsAt?: string | null
}

type RawRow = Record<string, unknown>

function toText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return String(error)
}

function normalizeTopicText(input?: string | null) {
  return input?.trim() ?? ''
}

function normalizeOptionalDate(input?: string | null) {
  const trimmed = input?.trim() ?? ''
  return trimmed || null
}

function normalizeIssueIds(issueIds?: string[] | null) {
  const normalizedIds: string[] = []
  const seenIds = new Set<string>()

  for (const issueId of issueIds ?? []) {
    const normalizedIssueId = issueId.trim()
    if (!normalizedIssueId || seenIds.has(normalizedIssueId)) {
      continue
    }

    seenIds.add(normalizedIssueId)
    normalizedIds.push(normalizedIssueId)
  }

  return normalizedIds
}

function validateScheduleWindow(startsAt?: string | null, endsAt?: string | null) {
  const normalizedStartsAt = normalizeOptionalDate(startsAt)
  const normalizedEndsAt = normalizeOptionalDate(endsAt)

  if (!normalizedStartsAt && !normalizedEndsAt) {
    return {
      ok: true as const,
      startsAt: null,
      endsAt: null,
    }
  }

  if (!normalizedStartsAt || !normalizedEndsAt) {
    return {
      ok: false as const,
      message: '开始时间和结束时间需要一起填写，不能只填一边。',
      error: 'INCOMPLETE_SCHEDULE',
    }
  }

  const startsAtMs = Date.parse(normalizedStartsAt)
  const endsAtMs = Date.parse(normalizedEndsAt)

  if (Number.isNaN(startsAtMs) || Number.isNaN(endsAtMs)) {
    return {
      ok: false as const,
      message: '辩题时间格式不正确，请重新选择开始和结束时间。',
      error: 'INVALID_SCHEDULE',
    }
  }

  if (endsAtMs <= startsAtMs) {
    return {
      ok: false as const,
      message: '结束时间必须晚于开始时间。',
      error: 'INVALID_SCHEDULE_WINDOW',
    }
  }

  return {
    ok: true as const,
    startsAt: new Date(startsAtMs).toISOString(),
    endsAt: new Date(endsAtMs).toISOString(),
  }
}

async function requireDebateTopicAdmin(): Promise<
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
        message: '无权访问辩题管理。',
        error: 'UNAUTHORIZED',
      },
    }
  }

  return {
    ok: true,
    userId: access.user.id,
  }
}

function mapDebateTopic(row: RawRow, linkedIssueIds: string[]): AdminDebateTopicSummary {
  return {
    id: String(row.id ?? ''),
    issueId: String(row.issue_id ?? ''),
    linkedIssueIds,
    title: toText(row.title),
    description: toText(row.description) || null,
    sortOrder: Number(row.sort_order ?? 0),
    startsAt: toText(row.starts_at) || null,
    endsAt: toText(row.ends_at) || null,
    createdAt: toText(row.created_at) || new Date(0).toISOString(),
  }
}

async function getIssueMetas(issueIds: string[]) {
  if (issueIds.length === 0) {
    return []
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('issues')
    .select('id, slug, label, title')
    .in('id', issueIds)

  if (error) {
    throw error
  }

  const issueMap = new Map<string, RawRow>()
  for (const row of (data as RawRow[] | null) ?? []) {
    issueMap.set(String(row.id ?? ''), row)
  }

  return issueIds.map((issueId) => issueMap.get(issueId)).filter((row): row is RawRow => Boolean(row))
}

async function getTopicLinkMap(topicIds: string[]) {
  const linkMap = new Map<string, string[]>()

  if (topicIds.length === 0) {
    return linkMap
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('debate_topic_issue_links')
    .select('debate_topic_id, issue_id')
    .in('debate_topic_id', topicIds)

  if (error) {
    throw error
  }

  for (const row of (data as RawRow[] | null) ?? []) {
    const topicId = String(row.debate_topic_id ?? '')
    const issueId = String(row.issue_id ?? '')

    if (!topicId || !issueId) {
      continue
    }

    const linkedIssueIds = linkMap.get(topicId) ?? []
    linkedIssueIds.push(issueId)
    linkMap.set(topicId, linkedIssueIds)
  }

  return linkMap
}

function sortTopics(topics: AdminDebateTopicSummary[]) {
  return [...topics].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder
    }

    return left.createdAt.localeCompare(right.createdAt)
  })
}

function revalidateDebateAdminPaths(issueSlugs: string[]) {
  revalidatePath('/')
  revalidatePath('/issues')
  revalidatePath('/ops-room')
  revalidatePath('/ops-room/articles')

  for (const issueSlug of issueSlugs) {
    if (!issueSlug) {
      continue
    }

    revalidatePath(`/issues/${issueSlug}`)
    revalidatePath(`/issues/${issueSlug}/debate`)
  }
}

export async function getAdminDebateTopics(
  issueId: string
): Promise<ActionResult<AdminDebateTopicSummary[]>> {
  try {
    const adminAccess = await requireDebateTopicAdmin()
    if (!adminAccess.ok) {
      return adminAccess.result
    }

    const normalizedIssueId = issueId.trim()
    if (!normalizedIssueId) {
      return {
        success: false,
        message: '缺少期刊 ID。',
        error: 'MISSING_ISSUE_ID',
      }
    }

    const adminClient = createAdminClient()
    const { data: linkRows, error: linkError } = await adminClient
      .from('debate_topic_issue_links')
      .select('debate_topic_id')
      .eq('issue_id', normalizedIssueId)

    if (linkError) {
      return {
        success: false,
        message: '获取辩题列表失败。',
        error: linkError.message,
      }
    }

    const topicIds = ((linkRows as RawRow[] | null) ?? [])
      .map((row) => String(row.debate_topic_id ?? ''))
      .filter(Boolean)

    if (topicIds.length === 0) {
      return {
        success: true,
        message: '获取成功。',
        data: [],
      }
    }

    const [{ data: topicRows, error: topicError }, linkMap] = await Promise.all([
      adminClient
        .from('debate_topics')
        .select('id, issue_id, title, description, sort_order, starts_at, ends_at, created_at')
        .in('id', topicIds),
      getTopicLinkMap(topicIds),
    ])

    if (topicError) {
      return {
        success: false,
        message: '获取辩题列表失败。',
        error: topicError.message,
      }
    }

    const topics = ((topicRows as RawRow[] | null) ?? []).map((row) =>
      mapDebateTopic(row, linkMap.get(String(row.id ?? '')) ?? [])
    )

    return {
      success: true,
      message: '获取成功。',
      data: sortTopics(topics),
    }
  } catch (error) {
    console.error('[getAdminDebateTopics] Unexpected error:', error)
    return {
      success: false,
      message: '获取辩题列表失败。',
      error: getErrorMessage(error),
    }
  }
}

export async function createAdminDebateTopic(
  input: CreateAdminDebateTopicInput
): Promise<ActionResult<AdminDebateTopicSummary>> {
  try {
    const adminAccess = await requireDebateTopicAdmin()
    if (!adminAccess.ok) {
      return adminAccess.result
    }

    const title = normalizeTopicText(input.title)
    const issueIds = normalizeIssueIds(input.issueIds)

    if (!title) {
      return {
        success: false,
        message: '请填写辩题标题。',
        error: 'MISSING_TITLE',
      }
    }

    if (issueIds.length === 0) {
      return {
        success: false,
        message: '请至少勾选一个显示期刊。',
        error: 'MISSING_VISIBLE_ISSUES',
      }
    }

    const schedule = validateScheduleWindow(input.startsAt, input.endsAt)
    if (!schedule.ok) {
      return {
        success: false,
        message: schedule.message,
        error: schedule.error,
      }
    }

    const issues = await getIssueMetas(issueIds)
    if (issues.length !== issueIds.length) {
      return {
        success: false,
        message: '有部分期刊不存在，无法保存这个辩题。',
        error: 'INVALID_ISSUE_IDS',
      }
    }

    const ownerIssueId = issueIds[0]
    const adminClient = createAdminClient()
    const { data: maxRow, error: maxRowError } = await adminClient
      .from('debate_topics')
      .select('sort_order')
      .eq('issue_id', ownerIssueId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (maxRowError) {
      return {
        success: false,
        message: '读取辩题排序失败。',
        error: maxRowError.message,
      }
    }

    const nextSortOrder = (maxRow ? Number(maxRow.sort_order ?? 0) : 0) + 1

    const { data: topic, error: insertTopicError } = await adminClient
      .from('debate_topics')
      .insert({
        issue_id: ownerIssueId,
        title,
        description: null,
        sort_order: nextSortOrder,
        starts_at: schedule.startsAt,
        ends_at: schedule.endsAt,
      })
      .select('id, issue_id, title, description, sort_order, starts_at, ends_at, created_at')
      .single()

    if (insertTopicError || !topic) {
      console.error('[createAdminDebateTopic] Failed to insert topic:', insertTopicError)
      return {
        success: false,
        message: '创建辩题失败，请检查 Supabase 配置。',
        error: insertTopicError?.message ?? 'INSERT_FAILED',
      }
    }

    const topicId = String((topic as RawRow).id ?? '')
    const { error: linkError } = await adminClient
      .from('debate_topic_issue_links')
      .insert(issueIds.map((linkedIssueId) => ({ debate_topic_id: topicId, issue_id: linkedIssueId })))

    if (linkError) {
      await adminClient.from('debate_topics').delete().eq('id', topicId)

      return {
        success: false,
        message: '辩题已创建草稿，但关联期刊失败，已自动回滚。',
        error: linkError.message,
      }
    }

    revalidateDebateAdminPaths(issues.map((issue) => toText(issue.slug)).filter(Boolean))

    return {
      success: true,
      message: '辩题已创建，并同步到选中的期刊。',
      data: mapDebateTopic(topic as RawRow, issueIds),
    }
  } catch (error) {
    console.error('[createAdminDebateTopic] Unexpected error:', error)
    return {
      success: false,
      message: '创建辩题失败。',
      error: getErrorMessage(error),
    }
  }
}

export async function updateAdminDebateTopic(
  input: UpdateAdminDebateTopicInput
): Promise<ActionResult<AdminDebateTopicSummary>> {
  try {
    const adminAccess = await requireDebateTopicAdmin()
    if (!adminAccess.ok) {
      return adminAccess.result
    }

    const topicId = input.topicId.trim()
    const title = normalizeTopicText(input.title)
    const issueIds = normalizeIssueIds(input.issueIds)

    if (!topicId) {
      return {
        success: false,
        message: '缺少辩题 ID。',
        error: 'MISSING_TOPIC_ID',
      }
    }

    if (!title) {
      return {
        success: false,
        message: '辩题标题不能为空。',
        error: 'MISSING_TITLE',
      }
    }

    if (issueIds.length === 0) {
      return {
        success: false,
        message: '请至少保留一个显示期刊。',
        error: 'MISSING_VISIBLE_ISSUES',
      }
    }

    const schedule = validateScheduleWindow(input.startsAt, input.endsAt)
    if (!schedule.ok) {
      return {
        success: false,
        message: schedule.message,
        error: schedule.error,
      }
    }

    const adminClient = createAdminClient()
    const [{ data: existingTopic, error: existingTopicError }, { data: existingLinkRows, error: existingLinksError }] =
      await Promise.all([
        adminClient.from('debate_topics').select('id, issue_id').eq('id', topicId).maybeSingle(),
        adminClient
          .from('debate_topic_issue_links')
          .select('issue_id')
          .eq('debate_topic_id', topicId),
      ])

    if (existingTopicError) {
      return {
        success: false,
        message: '读取辩题信息失败。',
        error: existingTopicError.message,
      }
    }

    if (existingLinksError) {
      return {
        success: false,
        message: '读取辩题所属期刊失败。',
        error: existingLinksError.message,
      }
    }

    if (!existingTopic) {
      return {
        success: false,
        message: '没有找到要更新的辩题。',
        error: 'TOPIC_NOT_FOUND',
      }
    }

    const oldIssueIds = ((existingLinkRows as RawRow[] | null) ?? [])
      .map((row) => String(row.issue_id ?? ''))
      .filter(Boolean)
    const allIssueIdsForRevalidation = normalizeIssueIds([...oldIssueIds, ...issueIds])
    const issues = await getIssueMetas(allIssueIdsForRevalidation)

    if (issues.length !== allIssueIdsForRevalidation.length) {
      return {
        success: false,
        message: '有部分期刊不存在，无法保存这个辩题。',
        error: 'INVALID_ISSUE_IDS',
      }
    }

    const ownerIssueId = issueIds[0]
    const { error: upsertLinksError } = await adminClient
      .from('debate_topic_issue_links')
      .upsert(
        issueIds.map((linkedIssueId) => ({
          debate_topic_id: topicId,
          issue_id: linkedIssueId,
        })),
        { onConflict: 'debate_topic_id,issue_id' }
      )

    if (upsertLinksError) {
      return {
        success: false,
        message: '保存辩题的期刊关联失败。',
        error: upsertLinksError.message,
      }
    }

    const { data: topic, error: updateTopicError } = await adminClient
      .from('debate_topics')
      .update({
        issue_id: ownerIssueId,
        title,
        description: null,
        starts_at: schedule.startsAt,
        ends_at: schedule.endsAt,
      })
      .eq('id', topicId)
      .select('id, issue_id, title, description, sort_order, starts_at, ends_at, created_at')
      .single()

    if (updateTopicError || !topic) {
      console.error('[updateAdminDebateTopic] Failed to update topic:', updateTopicError)
      return {
        success: false,
        message: '保存辩题失败。',
        error: updateTopicError?.message ?? 'UPDATE_FAILED',
      }
    }

    const removedIssueIds = oldIssueIds.filter((existingIssueId) => !issueIds.includes(existingIssueId))
    if (removedIssueIds.length > 0) {
      const { error: deleteLinksError } = await adminClient
        .from('debate_topic_issue_links')
        .delete()
        .eq('debate_topic_id', topicId)
        .in('issue_id', removedIssueIds)

      if (deleteLinksError) {
        return {
          success: false,
          message: '辩题已更新，但移除旧期刊关联失败，请重试一次。',
          error: deleteLinksError.message,
        }
      }
    }

    revalidateDebateAdminPaths(issues.map((issue) => toText(issue.slug)).filter(Boolean))

    return {
      success: true,
      message: '辩题已更新。',
      data: mapDebateTopic(topic as RawRow, issueIds),
    }
  } catch (error) {
    console.error('[updateAdminDebateTopic] Unexpected error:', error)
    return {
      success: false,
      message: '保存辩题失败。',
      error: getErrorMessage(error),
    }
  }
}

export async function deleteAdminDebateTopic(
  topicId: string
): Promise<ActionResult<{ deletedCommentCount: number }>> {
  try {
    const adminAccess = await requireDebateTopicAdmin()
    if (!adminAccess.ok) {
      return adminAccess.result
    }

    const normalizedTopicId = topicId.trim()
    if (!normalizedTopicId) {
      return {
        success: false,
        message: '缺少辩题 ID。',
        error: 'MISSING_TOPIC_ID',
      }
    }

    const adminClient = createAdminClient()
    const [{ data: topic, error: topicError }, { data: linkRows, error: linkError }] = await Promise.all([
      adminClient
        .from('debate_topics')
        .select('id, issue_id, title')
        .eq('id', normalizedTopicId)
        .maybeSingle(),
      adminClient
        .from('debate_topic_issue_links')
        .select('issue_id')
        .eq('debate_topic_id', normalizedTopicId),
    ])

    if (topicError) {
      return {
        success: false,
        message: '读取辩题信息失败。',
        error: topicError.message,
      }
    }

    if (linkError) {
      return {
        success: false,
        message: '读取辩题所属期刊失败。',
        error: linkError.message,
      }
    }

    if (!topic) {
      return {
        success: false,
        message: '没有找到要删除的辩题。',
        error: 'TOPIC_NOT_FOUND',
      }
    }

    const issueIds = ((linkRows as RawRow[] | null) ?? [])
      .map((row) => String(row.issue_id ?? ''))
      .filter(Boolean)
    const issues = await getIssueMetas(issueIds)

    const { data: commentRows, error: commentFetchError } = await adminClient
      .from('debate_comments')
      .select('id')
      .eq('topic_id', normalizedTopicId)

    if (commentFetchError) {
      return {
        success: false,
        message: '读取辩题评论失败。',
        error: commentFetchError.message,
      }
    }

    const commentIds = ((commentRows as RawRow[] | null) ?? [])
      .map((row) => String(row.id ?? ''))
      .filter(Boolean)

    if (commentIds.length > 0) {
      const [deleteLikesResult, deleteDislikesResult, deleteCommentsResult] = await Promise.all([
        adminClient.from('debate_comment_likes').delete().in('comment_id', commentIds),
        adminClient.from('debate_comment_dislikes').delete().in('comment_id', commentIds),
        adminClient.from('debate_comments').delete().in('id', commentIds),
      ])

      const childDeleteError =
        deleteLikesResult.error ?? deleteDislikesResult.error ?? deleteCommentsResult.error

      if (childDeleteError) {
        return {
          success: false,
          message: '删除辩题互动数据失败。',
          error: childDeleteError.message,
        }
      }
    }

    const { error: deleteTopicError } = await adminClient
      .from('debate_topics')
      .delete()
      .eq('id', normalizedTopicId)

    if (deleteTopicError) {
      return {
        success: false,
        message: '删除辩题失败。',
        error: deleteTopicError.message,
      }
    }

    revalidateDebateAdminPaths(issues.map((issue) => toText(issue.slug)).filter(Boolean))

    return {
      success: true,
      message: `辩题“${toText(topic.title) || '未命名辩题'}”已删除。`,
      data: {
        deletedCommentCount: commentIds.length,
      },
    }
  } catch (error) {
    console.error('[deleteAdminDebateTopic] Unexpected error:', error)
    return {
      success: false,
      message: '删除辩题失败。',
      error: getErrorMessage(error),
    }
  }
}
