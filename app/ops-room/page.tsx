import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import InviteCodesPanel from '@/components/ops-room/invite-codes-panel'
import { buildLoginRedirect, getAdminAccess } from '@/lib/admin-access'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '操作室 | 星火',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function OpsRoomPage() {
  const access = await getAdminAccess()

  if (!access.user) {
    redirect(buildLoginRedirect('/ops-room'))
  }

  if (!access.isAdmin) {
    notFound()
  }

  return <InviteCodesPanel />
}
