import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const RESET_PASSWORD_PATH = '/reset-password'
const FORGOT_PASSWORD_PATH = '/login?mode=forgot'

function buildRedirectUrl(request: NextRequest, path: string) {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'

  if (process.env.NODE_ENV === 'development' || !forwardedHost) {
    return `${request.nextUrl.origin}${path}`
  }

  return `${forwardedProto}://${forwardedHost}${path}`
}

function withQuery(path: string, entries: Record<string, string>) {
  const params = new URLSearchParams(entries)
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}${params.toString()}`
}

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const code = request.nextUrl.searchParams.get('code')
  const tokenHash = request.nextUrl.searchParams.get('token_hash')
  const type = request.nextUrl.searchParams.get('type')
  const providerError = request.nextUrl.searchParams.get('error_description')

  if (providerError) {
    return NextResponse.redirect(
      buildRedirectUrl(
        request,
        withQuery(FORGOT_PASSWORD_PATH, {
          message: providerError,
          type: 'error',
        })
      )
    )
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(
        buildRedirectUrl(
          request,
          withQuery(RESET_PASSWORD_PATH, {
            ready: '1',
          })
        )
      )
    }

    console.error('[auth/callback] exchangeCodeForSession 失败:', error)
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    })

    if (!error) {
      return NextResponse.redirect(
        buildRedirectUrl(
          request,
          withQuery(RESET_PASSWORD_PATH, {
            ready: '1',
          })
        )
      )
    }

    console.error('[auth/callback] verifyOtp 失败:', error)
  }

  return NextResponse.redirect(
    buildRedirectUrl(
      request,
      withQuery(FORGOT_PASSWORD_PATH, {
        message: '重置链接无效或已过期，请重新申请找回密码。',
        type: 'error',
      })
    )
  )
}
