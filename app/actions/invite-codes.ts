'use server'

/**
 * 邀请码管理 Server Actions
 * 用于管理员查看、生成、管理邀请码
 */

import { createAdminClient } from '@/lib/supabase/admin'

// ============================================
// 类型定义
// ============================================

export interface InviteCode {
  id: string
  code: string
  is_used: boolean
  used_by_user_id: string | null
  used_at: string | null
  created_at: string
  // 关联的用户信息（如果已使用）
  used_by_email?: string
}

interface ActionResult<T = null> {
  success: boolean
  message: string
  data?: T
  error?: string
}

// ============================================
// 辅助函数
// ============================================

/**
 * 生成随机邀请码（格式：XXXX-XXXX）
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 排除容易混淆的字符 I, O, 0, 1
  let code = ''
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-'
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// ============================================
// Server Actions
// ============================================

/**
 * 获取所有邀请码列表
 */
export async function getInviteCodes(): Promise<ActionResult<InviteCode[]>> {
  try {
    const adminClient = createAdminClient()

    const { data: codes, error } = await adminClient
      .from('invite_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[getInviteCodes] 查询失败:', error)
      return {
        success: false,
        message: '获取邀请码列表失败',
        error: error.message,
      }
    }

    // 获取已使用邀请码对应的用户邮箱
    const usedCodes = codes?.filter(c => c.used_by_user_id) || []
    const userIds = usedCodes.map(c => c.used_by_user_id)

    let userEmails: Record<string, string> = {}
    
    if (userIds.length > 0) {
      const { data: users } = await adminClient.auth.admin.listUsers()
      if (users?.users) {
        users.users.forEach(user => {
          if (userIds.includes(user.id)) {
            userEmails[user.id] = user.email || '未知'
          }
        })
      }
    }

    // 合并用户邮箱信息
    const codesWithEmail: InviteCode[] = (codes || []).map(code => ({
      ...code,
      used_by_email: code.used_by_user_id ? userEmails[code.used_by_user_id] : undefined,
    }))

    return {
      success: true,
      message: '获取成功',
      data: codesWithEmail,
    }
  } catch (error) {
    console.error('[getInviteCodes] 异常:', error)
    return {
      success: false,
      message: '获取邀请码列表失败',
      error: String(error),
    }
  }
}

/**
 * 生成新的邀请码
 * @param count 生成数量（默认1个，最多20个）
 */
export async function createInviteCodes(count: number = 1): Promise<ActionResult<string[]>> {
  try {
    // 限制单次生成数量
    const safeCount = Math.min(Math.max(1, count), 20)
    
    const adminClient = createAdminClient()
    const newCodes: string[] = []

    // 生成不重复的邀请码
    for (let i = 0; i < safeCount; i++) {
      let code: string
      let exists = true
      let attempts = 0

      // 确保生成的邀请码不重复
      while (exists && attempts < 10) {
        code = generateInviteCode()
        const { data } = await adminClient
          .from('invite_codes')
          .select('id')
          .eq('code', code)
          .single()
        
        exists = !!data
        attempts++
        
        if (!exists) {
          newCodes.push(code!)
        }
      }
    }

    if (newCodes.length === 0) {
      return {
        success: false,
        message: '生成邀请码失败，请重试',
        error: 'GENERATION_FAILED',
      }
    }

    // 批量插入邀请码
    const { error } = await adminClient
      .from('invite_codes')
      .insert(newCodes.map(code => ({ code, is_used: false })))

    if (error) {
      console.error('[createInviteCodes] 插入失败:', error)
      return {
        success: false,
        message: '保存邀请码失败',
        error: error.message,
      }
    }

    return {
      success: true,
      message: `成功生成 ${newCodes.length} 个邀请码`,
      data: newCodes,
    }
  } catch (error) {
    console.error('[createInviteCodes] 异常:', error)
    return {
      success: false,
      message: '生成邀请码失败',
      error: String(error),
    }
  }
}

/**
 * 删除未使用的邀请码
 */
export async function deleteInviteCode(codeId: string): Promise<ActionResult> {
  try {
    const adminClient = createAdminClient()

    // 先检查邀请码是否已被使用
    const { data: code, error: fetchError } = await adminClient
      .from('invite_codes')
      .select('is_used')
      .eq('id', codeId)
      .single()

    if (fetchError || !code) {
      return {
        success: false,
        message: '邀请码不存在',
        error: 'NOT_FOUND',
      }
    }

    if (code.is_used) {
      return {
        success: false,
        message: '已使用的邀请码不能删除',
        error: 'ALREADY_USED',
      }
    }

    // 删除邀请码
    const { error: deleteError } = await adminClient
      .from('invite_codes')
      .delete()
      .eq('id', codeId)

    if (deleteError) {
      console.error('[deleteInviteCode] 删除失败:', deleteError)
      return {
        success: false,
        message: '删除失败',
        error: deleteError.message,
      }
    }

    return {
      success: true,
      message: '删除成功',
    }
  } catch (error) {
    console.error('[deleteInviteCode] 异常:', error)
    return {
      success: false,
      message: '删除邀请码失败',
      error: String(error),
    }
  }
}

/**
 * 获取邀请码统计信息
 */
export async function getInviteCodeStats(): Promise<ActionResult<{
  total: number
  used: number
  available: number
}>> {
  try {
    const adminClient = createAdminClient()

    const { data: codes, error } = await adminClient
      .from('invite_codes')
      .select('is_used')

    if (error) {
      return {
        success: false,
        message: '获取统计失败',
        error: error.message,
      }
    }

    const total = codes?.length || 0
    const used = codes?.filter(c => c.is_used).length || 0
    const available = total - used

    return {
      success: true,
      message: '获取成功',
      data: { total, used, available },
    }
  } catch (error) {
    return {
      success: false,
      message: '获取统计失败',
      error: String(error),
    }
  }
}
