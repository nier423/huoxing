import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function appendReadyParam(path: string) {
  return path.includes('?') ? `${path}&ready=1` : `${path}?ready=1`
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const safeNext = next?.startsWith('/') ? next : '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (isLocalEnv) {
        return NextResponse.redirect(`${requestUrl.origin}${appendReadyParam(safeNext)}`)
      }

      if (forwardedHost) {
        return NextResponse.redirect(
          `https://${forwardedHost}${appendReadyParam(safeNext)}`
        )
      }

      return NextResponse.redirect(`${requestUrl.origin}${appendReadyParam(safeNext)}`)
    }
  }

  const errorMessage = encodeURIComponent('重置链接无效或已过期，请重新申请找回密码。')
  return NextResponse.redirect(
    `${requestUrl.origin}/login?mode=forgot&message=${errorMessage}&type=error`
  )
}
