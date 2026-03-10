'use server'

/**
 * 身份验证 Server Actions
 * 处理用户注册（带邀请码验证）和登录逻辑
 */

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ============================================
// 类型定义
// ============================================

interface AuthResult {
  success: boolean
  message: string
  error?: string
}

interface SignUpData {
  email: string
  password: string
  inviteCode: string
  displayName?: string
}

interface SignInData {
  email: string
  password: string
}

// ============================================
// 辅助函数
// ============================================

/**
 * 格式化邀请码：统一转为大写并去除空格
 */
function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '')
}

/**
 * 验证邮箱格式
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证密码强度
 */
function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 6) {
    return { valid: false, message: '密码长度至少需要 6 位' }
  }
  if (password.length > 72) {
    return { valid: false, message: '密码长度不能超过 72 位' }
  }
  return { valid: true, message: '' }
}

// ============================================
// 注册 Server Action
// ============================================

/**
 * 使用邀请码注册新用户
 * 
 * 流程：
 * 1. 参数校验
 * 2. 验证邀请码有效性（使用 Admin 客户端绕过 RLS）
 * 3. 创建用户账号
 * 4. 销毁（标记已使用）邀请码
 * 5. 创建用户档案
 * 
 * @param data - 包含 email, password, inviteCode 的注册数据
 * @returns AuthResult - 操作结果
 */
export async function signUpWithCode(data: SignUpData): Promise<AuthResult> {
  const { email, password, inviteCode, displayName } = data

  // ----------------------------------------
  // Step 1: 参数校验
  // ----------------------------------------
  
  if (!email || !password || !inviteCode) {
    return {
      success: false,
      message: '请填写所有必填字段',
      error: 'MISSING_FIELDS',
    }
  }

  if (!isValidEmail(email)) {
    return {
      success: false,
      message: '请输入有效的邮箱地址',
      error: 'INVALID_EMAIL',
    }
  }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    return {
      success: false,
      message: passwordValidation.message,
      error: 'INVALID_PASSWORD',
    }
  }

  const normalizedCode = normalizeInviteCode(inviteCode)
  if (!normalizedCode) {
    return {
      success: false,
      message: '请输入邀请码',
      error: 'MISSING_INVITE_CODE',
    }
  }

  // ----------------------------------------
  // Step 2: 验证邀请码（使用 Admin 客户端绕过 RLS）
  // ----------------------------------------

  const adminClient = createAdminClient()

  const { data: inviteCodeData, error: inviteCodeError } = await adminClient
    .from('invite_codes')
    .select('id, code, is_used, used_by_user_id')
    .eq('code', normalizedCode)
    .single()

  if (inviteCodeError || !inviteCodeData) {
    return {
      success: false,
      message: '邀请码无效或已被使用',
      error: 'INVALID_INVITE_CODE',
    }
  }

  if (inviteCodeData.is_used) {
    return {
      success: false,
      message: '邀请码无效或已被使用',
      error: 'INVITE_CODE_USED',
    }
  }

  // ----------------------------------------
  // Step 3: 创建用户账号
  // ----------------------------------------

  const { data: newUser, error: createUserError } = await adminClient.auth.admin.createUser({
    email: email.toLowerCase().trim(),
    password,
    email_confirm: true, // 自动确认邮箱，因为是邀请制
    user_metadata: {
      display_name: displayName || email.split('@')[0],
      invite_code: normalizedCode,
    },
  })

  if (createUserError || !newUser.user) {
    // 处理常见错误
    if (createUserError?.message?.includes('already been registered')) {
      return {
        success: false,
        message: '该邮箱已被注册',
        error: 'EMAIL_EXISTS',
      }
    }
    
    console.error('[signUpWithCode] 创建用户失败:', createUserError)
    return {
      success: false,
      message: '账号创建失败，请稍后重试',
      error: 'CREATE_USER_FAILED',
    }
  }

  const userId = newUser.user.id

  // ----------------------------------------
  // Step 4: 销毁邀请码
  // ----------------------------------------

  const { error: updateCodeError } = await adminClient
    .from('invite_codes')
    .update({
      is_used: true,
      used_by_user_id: userId,
      used_at: new Date().toISOString(),
    })
    .eq('id', inviteCodeData.id)

  if (updateCodeError) {
    // 记录错误但不回滚用户创建（邀请码更新失败不影响用户使用）
    console.error('[signUpWithCode] 更新邀请码状态失败:', updateCodeError)
  }

  // ----------------------------------------
  // Step 5: 创建用户档案
  // ----------------------------------------

  const { error: profileError } = await adminClient
    .from('profiles')
    .insert({
      id: userId,
      display_name: displayName || email.split('@')[0],
      // invited_by 字段稍后可根据邀请码所有者完善
    })

  if (profileError) {
    console.error('[signUpWithCode] 创建用户档案失败:', profileError)
    // 档案创建失败不影响注册成功，可后续补充
  }

  // ----------------------------------------
  // 返回成功结果
  // ----------------------------------------

  return {
    success: true,
    message: '注册成功！欢迎加入星火社区',
  }
}

// ============================================
// 登录 Server Action
// ============================================

/**
 * 使用邮箱和密码登录
 * 
 * 使用标准 SSR 客户端，正确设置 Session Cookies
 * 确保用户刷新页面后仍保持登录状态
 * 
 * @param data - 包含 email 和 password 的登录数据
 * @returns AuthResult - 操作结果
 */
export async function signInWithEmail(data: SignInData): Promise<AuthResult> {
  const { email, password } = data

  // ----------------------------------------
  // Step 1: 参数校验
  // ----------------------------------------

  if (!email || !password) {
    return {
      success: false,
      message: '请输入邮箱和密码',
      error: 'MISSING_FIELDS',
    }
  }

  if (!isValidEmail(email)) {
    return {
      success: false,
      message: '请输入有效的邮箱地址',
      error: 'INVALID_EMAIL',
    }
  }

  // ----------------------------------------
  // Step 2: 执行登录（使用 SSR 客户端，自动处理 Cookies）
  // ----------------------------------------

  const supabase = createClient()

  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  })

  if (signInError || !authData.user) {
    // 处理常见错误
    if (signInError?.message?.includes('Invalid login credentials')) {
      return {
        success: false,
        message: '邮箱或密码错误',
        error: 'INVALID_CREDENTIALS',
      }
    }

    if (signInError?.message?.includes('Email not confirmed')) {
      return {
        success: false,
        message: '请先验证您的邮箱',
        error: 'EMAIL_NOT_CONFIRMED',
      }
    }

    console.error('[signInWithEmail] 登录失败:', signInError)
    return {
      success: false,
      message: '登录失败，请稍后重试',
      error: 'SIGN_IN_FAILED',
    }
  }

  // ----------------------------------------
  // 返回成功结果
  // ----------------------------------------

  return {
    success: true,
    message: '登录成功！',
  }
}

// ============================================
// 登出 Server Action
// ============================================

/**
 * 用户登出
 * 清除 Session Cookies
 */
export async function signOut(): Promise<AuthResult> {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('[signOut] 登出失败:', error)
    return {
      success: false,
      message: '登出失败，请稍后重试',
      error: 'SIGN_OUT_FAILED',
    }
  }

  revalidatePath('/', 'layout')
  
  return {
    success: true,
    message: '已成功登出',
  }
}

// ============================================
// 获取当前用户 Server Action
// ============================================

/**
 * 获取当前登录用户信息
 * 用于服务端组件获取用户状态
 */
export async function getCurrentUser() {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * 获取当前用户的档案信息
 */
export async function getCurrentUserProfile() {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('[getCurrentUserProfile] 获取档案失败:', profileError)
    return null
  }

  return {
    user,
    profile,
  }
}
