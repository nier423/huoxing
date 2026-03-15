'use server'

import { getAdminAccess } from '@/lib/admin-access'
import { createAdminClient } from '@/lib/supabase/admin'

export interface InviteCode {
  created_at: string
  id: string
  code: string
  is_used: boolean
  used_by_user_id: string | null
  used_at: string | null
  used_by_email?: string
}

interface ActionResult<T = null> {
  success: boolean
  message: string
  data?: T
  error?: string
}

async function requireInviteCodeAdmin(): Promise<
  | { ok: true; userId: string }
  | { ok: false; error: string; message: string }
> {
  const access = await getAdminAccess()

  if (access.error === 'NOT_AUTHENTICATED') {
    return {
      ok: false,
      message: '请先登录。',
      error: 'NOT_AUTHENTICATED',
    }
  }

  if (access.error) {
    return {
      ok: false,
      message: '管理员身份校验失败。',
      error: access.error,
    }
  }

  if (!access.isAdmin || !access.user) {
    return {
      ok: false,
      message: '无权访问该页面。',
      error: 'UNAUTHORIZED',
    }
  }

  return {
    ok: true,
    userId: access.user.id,
  }
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''

  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-'
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return code
}

export async function getInviteCodes(): Promise<ActionResult<InviteCode[]>> {
  try {
    const adminAccess = await requireInviteCodeAdmin()
    if (!adminAccess.ok) {
      return {
        success: false,
        message: adminAccess.message,
        error: adminAccess.error,
      }
    }

    const adminClient = createAdminClient()
    const { data: codes, error } = await adminClient
      .from('invite_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[getInviteCodes] Failed to load invite codes:', error)
      return {
        success: false,
        message: '获取邀请码列表失败。',
        error: error.message,
      }
    }

    const usedCodes = codes?.filter((code) => code.used_by_user_id) ?? []
    const userIds = usedCodes
      .map((code) => code.used_by_user_id)
      .filter((value): value is string => Boolean(value))

    const userEmails: Record<string, string> = {}

    if (userIds.length > 0) {
      const { data: usersData } = await adminClient.auth.admin.listUsers()
      for (const user of usersData?.users ?? []) {
        if (userIds.includes(user.id)) {
          userEmails[user.id] = user.email || '未知用户'
        }
      }
    }

    return {
      success: true,
      message: '获取成功。',
      data: (codes ?? []).map((code) => ({
        ...code,
        used_by_email: code.used_by_user_id
          ? userEmails[code.used_by_user_id]
          : undefined,
      })),
    }
  } catch (error) {
    console.error('[getInviteCodes] Unexpected error:', error)
    return {
      success: false,
      message: '获取邀请码列表失败。',
      error: String(error),
    }
  }
}

export async function createInviteCodes(
  count: number = 1
): Promise<ActionResult<string[]>> {
  try {
    const adminAccess = await requireInviteCodeAdmin()
    if (!adminAccess.ok) {
      return {
        success: false,
        message: adminAccess.message,
        error: adminAccess.error,
      }
    }

    const safeCount = Math.min(Math.max(1, count), 20)
    const adminClient = createAdminClient()
    const newCodes: string[] = []

    for (let i = 0; i < safeCount; i++) {
      let code = ''
      let exists = true
      let attempts = 0

      while (exists && attempts < 10) {
        code = generateInviteCode()

        const { data } = await adminClient
          .from('invite_codes')
          .select('id')
          .eq('code', code)
          .single()

        exists = Boolean(data)
        attempts++

        if (!exists) {
          newCodes.push(code)
        }
      }
    }

    if (newCodes.length === 0) {
      return {
        success: false,
        message: '生成邀请码失败，请稍后重试。',
        error: 'GENERATION_FAILED',
      }
    }

    const { error } = await adminClient
      .from('invite_codes')
      .insert(newCodes.map((code) => ({ code, is_used: false })))

    if (error) {
      console.error('[createInviteCodes] Failed to insert invite codes:', error)
      return {
        success: false,
        message: '保存邀请码失败。',
        error: error.message,
      }
    }

    return {
      success: true,
      message: `成功生成 ${newCodes.length} 个邀请码。`,
      data: newCodes,
    }
  } catch (error) {
    console.error('[createInviteCodes] Unexpected error:', error)
    return {
      success: false,
      message: '生成邀请码失败。',
      error: String(error),
    }
  }
}

export async function deleteInviteCode(codeId: string): Promise<ActionResult> {
  try {
    const adminAccess = await requireInviteCodeAdmin()
    if (!adminAccess.ok) {
      return {
        success: false,
        message: adminAccess.message,
        error: adminAccess.error,
      }
    }

    const adminClient = createAdminClient()
    const { data: code, error: fetchError } = await adminClient
      .from('invite_codes')
      .select('is_used')
      .eq('id', codeId)
      .single()

    if (fetchError || !code) {
      return {
        success: false,
        message: '邀请码不存在。',
        error: 'NOT_FOUND',
      }
    }

    if (code.is_used) {
      return {
        success: false,
        message: '已使用的邀请码不能删除。',
        error: 'ALREADY_USED',
      }
    }

    const { error: deleteError } = await adminClient
      .from('invite_codes')
      .delete()
      .eq('id', codeId)

    if (deleteError) {
      console.error('[deleteInviteCode] Failed to delete invite code:', deleteError)
      return {
        success: false,
        message: '删除失败。',
        error: deleteError.message,
      }
    }

    return {
      success: true,
      message: '删除成功。',
    }
  } catch (error) {
    console.error('[deleteInviteCode] Unexpected error:', error)
    return {
      success: false,
      message: '删除邀请码失败。',
      error: String(error),
    }
  }
}

export async function getInviteCodeStats(): Promise<
  ActionResult<{
    total: number
    used: number
    available: number
  }>
> {
  try {
    const adminAccess = await requireInviteCodeAdmin()
    if (!adminAccess.ok) {
      return {
        success: false,
        message: adminAccess.message,
        error: adminAccess.error,
      }
    }

    const adminClient = createAdminClient()
    const { data: codes, error } = await adminClient
      .from('invite_codes')
      .select('is_used')

    if (error) {
      return {
        success: false,
        message: '获取统计失败。',
        error: error.message,
      }
    }

    const total = codes?.length ?? 0
    const used = codes?.filter((code) => code.is_used).length ?? 0
    const available = total - used

    return {
      success: true,
      message: '获取成功。',
      data: { total, used, available },
    }
  } catch (error) {
    console.error('[getInviteCodeStats] Unexpected error:', error)
    return {
      success: false,
      message: '获取统计失败。',
      error: String(error),
    }
  }
}
