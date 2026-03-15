import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type AdminAccessError =
  | 'NOT_AUTHENTICATED'
  | 'PROFILE_LOOKUP_FAILED'
  | 'PROFILE_NOT_FOUND'
  | null

interface AdminAccessResult {
  error: AdminAccessError
  isAdmin: boolean
  user: {
    email: string | null
    id: string
  } | null
}

export function buildLoginRedirect(pathname: string) {
  return `/login?redirectTo=${encodeURIComponent(pathname)}`
}

export async function getAdminAccess(): Promise<AdminAccessResult> {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      error: 'NOT_AUTHENTICATED',
      isAdmin: false,
      user: null,
    }
  }

  const adminClient = createAdminClient()
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('[getAdminAccess] Failed to load profile:', profileError)
    return {
      error: 'PROFILE_LOOKUP_FAILED',
      isAdmin: false,
      user: {
        id: user.id,
        email: user.email ?? null,
      },
    }
  }

  if (!profile) {
    return {
      error: 'PROFILE_NOT_FOUND',
      isAdmin: false,
      user: {
        id: user.id,
        email: user.email ?? null,
      },
    }
  }

  return {
    error: null,
    isAdmin: profile.is_admin === true,
    user: {
      id: user.id,
      email: user.email ?? null,
    },
  }
}
