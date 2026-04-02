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
  title: string
  description: string | null
  sortOrder: number
  startsAt: string | null
  endsAt: string | null
  createdAt: string
}

interface CreateAdminDebateTopicInput {
  issueId: string
  title: string
  description?: string | null
  startsAt?: string | null
  endsAt?: string | null
}

interface UpdateAdminDebateTopicInput {
  topicId: string
  title: string
  description?: string | null
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

function mapDebateTopic(row: RawRow): AdminDebateTopicSummary {
  return {
    id: String(row.id ?? ''),
    issueId: String(row.issue_id ?? ''),
    title: toText(row.title),
    description: toText(row.description) || null,
    sortOrder: Number(row.sort_order ?? 0),
    startsAt: toText(row.starts_at) || null,
    endsAt: toText(row.ends_at) || null,
    createdAt: toText(row.created_at) || new Date(0).toISOString(),
  }
}

function normalizeTopicText(input?: string | null) {
  return input?.trim() ?? ''
}

function normalizeTopicDescription(input?: string | null) {
  const trimmed = input?.trim() ?? ''
  return trimmed || null
}

function normalizeOptionalDate(input?: string | null) {
  const trimmed = input?.trim() ?? ''
  return trimmed || null
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

async function getIssueMeta(issueId: string) {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('issues')
    .select('id, slug, label, title')
    .eq('id', issueId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return (data as RawRow | null) ?? null
}

function revalidateDebateAdminPaths(issueSlug: string | null) {
  revalidatePath('/')
  revalidatePath('/issues')
  revalidatePath('/ops-room')
  revalidatePath('/ops-room/articles')

  if (!issueSlug) {
    return
  }

  revalidatePath(`/issues/${issueSlug}`)
  revalidatePath(`/issues/${issueSlug}/debate`)
}

export async function getAdminDebateTopics(
  issueId: string
): Promise<ActionResult<AdminDebateTopicSummary[]>> {
  try {
    const adminAccess = await requireDebateTopicAdmin()
    if (!adminAccess.ok) {
      return adminAccess.result
    }

    if (!issueId) {
      return {
        success: false,
        message: '缺少期刊 ID。',
        error: 'MISSING_ISSUE_ID',
      }
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('debate_topics')
      .select('id, issue_id, title, description, sort_order, starts_at, ends_at, created_at')
      .eq('issue_id', issueId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      return {
        success: false,
        message: '获取辩题列表失败。',
        error: error.message,
      }
    }

    return {
      success: true,
      message: '获取成功。',
      data: (data ?? []).map((row) => mapDebateTopic(row as RawRow)),
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

    const issueId = input.issueId.trim()
    const title = normalizeTopicText(input.title)
    const description = normalizeTopicDescription(input.description)

    if (!issueId) {
      return {
        success: false,
        message: '请选择要绑定的期刊。',
        error: 'MISSING_ISSUE_ID',
      }
    }

    if (!title) {
      return {
        success: false,
        message: '请填写辩题标题。',
        error: 'MISSING_TITLE',
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

    const issue = await getIssueMeta(issueId)
    if (!issue) {
      return {
        success: false,
        message: '没有找到对应的期刊。',
        error: 'ISSUE_NOT_FOUND',
      }
    }

    const adminClient = createAdminClient()
    const { data: maxRow, error: maxRowError } = await adminClient
      .from('debate_topics')
      .select('sort_order')
      .eq('issue_id', issueId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (maxRowError) {
      return {
        success: false,
        message: '读取当前期刊辩题排序失败。',
        error: maxRowError.message,
      }
    }

    const nextSortOrder = (maxRow ? Number(maxRow.sort_order ?? 0) : 0) + 1

    const { data, error } = await adminClient
      .from('debate_topics')
      .insert({
        issue_id: issueId,
        title,
        description,
        sort_order: nextSortOrder,
        starts_at: schedule.startsAt,
        ends_at: schedule.endsAt,
      })
      .select('id, issue_id, title, description, sort_order, starts_at, ends_at, created_at')
      .single()

    if (error || !data) {
      console.error('[createAdminDebateTopic] Failed to insert topic:', error)
      return {
        success: false,
        message: '创建辩题失败，请检查 Supabase 配置。',
        error: error?.message ?? 'INSERT_FAILED',
      }
    }

    revalidateDebateAdminPaths(toText(issue.slug) || null)

    return {
      success: true,
      message: `已为 ${toText(issue.label) || '该期刊'} 新增辩题。`,
      data: mapDebateTopic(data as RawRow),
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
    const description = normalizeTopicDescription(input.description)

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

    const schedule = validateScheduleWindow(input.startsAt, input.endsAt)
    if (!schedule.ok) {
      return {
        success: false,
        message: schedule.message,
        error: schedule.error,
      }
    }

    const adminClient = createAdminClient()
    const { data: existingTopic, error: existingTopicError } = await adminClient
      .from('debate_topics')
      .select('id, issue_id')
      .eq('id', topicId)
      .maybeSingle()

    if (existingTopicError) {
      return {
        success: false,
        message: '读取辩题信息失败。',
        error: existingTopicError.message,
      }
    }

    if (!existingTopic) {
      return {
        success: false,
        message: '没有找到要更新的辩题。',
        error: 'TOPIC_NOT_FOUND',
      }
    }

    const issue = await getIssueMeta(String(existingTopic.issue_id ?? ''))

    const { data, error } = await adminClient
      .from('debate_topics')
      .update({
        title,
        description,
        starts_at: schedule.startsAt,
        ends_at: schedule.endsAt,
      })
      .eq('id', topicId)
      .select('id, issue_id, title, description, sort_order, starts_at, ends_at, created_at')
      .single()

    if (error || !data) {
      console.error('[updateAdminDebateTopic] Failed to update topic:', error)
      return {
        success: false,
        message: '保存辩题失败。',
        error: error?.message ?? 'UPDATE_FAILED',
      }
    }

    revalidateDebateAdminPaths(toText(issue?.slug) || null)

    return {
      success: true,
      message: '辩题已更新。',
      data: mapDebateTopic(data as RawRow),
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

    if (!topicId) {
      return {
        success: false,
        message: '缺少辩题 ID。',
        error: 'MISSING_TOPIC_ID',
      }
    }

    const adminClient = createAdminClient()
    const { data: topic, error: topicError } = await adminClient
      .from('debate_topics')
      .select('id, issue_id, title')
      .eq('id', topicId)
      .maybeSingle()

    if (topicError) {
      return {
        success: false,
        message: '读取辩题信息失败。',
        error: topicError.message,
      }
    }

    if (!topic) {
      return {
        success: false,
        message: '没有找到要删除的辩题。',
        error: 'TOPIC_NOT_FOUND',
      }
    }

    const issue = await getIssueMeta(String(topic.issue_id ?? ''))

    const { data: commentRows, error: commentFetchError } = await adminClient
      .from('debate_comments')
      .select('id')
      .eq('topic_id', topicId)

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
      .eq('id', topicId)

    if (deleteTopicError) {
      return {
        success: false,
        message: '删除辩题失败。',
        error: deleteTopicError.message,
      }
    }

    revalidateDebateAdminPaths(toText(issue?.slug) || null)

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
