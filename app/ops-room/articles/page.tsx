import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import ArticlePublisherPanel from '@/components/ops-room/article-publisher-panel'
import { buildLoginRedirect, getAdminAccess } from '@/lib/admin-access'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '总编辑发布台 | 星火',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function OpsRoomArticlesPage() {
  const access = await getAdminAccess()

  if (!access.user) {
    redirect(buildLoginRedirect('/ops-room/articles'))
  }

  if (!access.isAdmin) {
    notFound()
  }

  return <ArticlePublisherPanel />
}
