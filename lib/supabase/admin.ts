/**
 * Supabase Admin 客户端
 * 使用 Service Role Key，绕过 RLS 策略
 * 仅在服务端使用，用于管理员级别的操作
 * 警告：请勿在客户端代码中暴露此客户端
 */

import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('缺少 Supabase 环境变量配置')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
