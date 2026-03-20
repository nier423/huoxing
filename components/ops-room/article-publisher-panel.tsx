'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FilePlus2, Loader2, RefreshCw } from 'lucide-react'
import {
  createAdminArticle,
  deleteAdminArticle,
  getAdminArticles,
  getAdminIssues,
  replaceAdminArticle,
  updateIssuePublishedAt,
  uploadIssueCoverImage,
  updateArticlePublishedAt,
} from '@/app/actions/articles-admin'
import { getIssueDisplayTitle } from '@/lib/issue-display'

interface AdminIssueSummary {
  id: string
  coverImage: string | null
  isCurrent: boolean
  label: string
  publishedAt: string | null
  slug: string
  sortOrder: number
  title: string
}

interface AdminArticleSummary {
  author: string
  category: string
  id: string
  isPublished: boolean
  issueId: string | null
  issueLabel: string | null
  issueSlug: string | null
  publishedAt: string | null
  slug: string
  title: string
}

interface SelectedArticleTime {
  articleId: string
  publishedAt: string
  title: string
}

const OPS_ROOM_ARTICLE_LOGIN_PATH = '/login?redirectTo=%2Fops-room%2Farticles'
const ARTICLE_CATEGORIES = ['有话慢谈', '人间剧场', '胡说八道', '三行两句', '见字如面']

function formatDateTime(value: string | null) {
  if (!value) {
    return '未记录'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function normalizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fff-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getDefaultIssueId(issues: AdminIssueSummary[]) {
  return getAutoCurrentIssue(issues)?.id ?? issues[0]?.id ?? ''
}

function getAutoCurrentIssue(issues: AdminIssueSummary[]) {
  const now = Date.now()
  const publishedIssues = issues.filter((issue) => {
    if (!issue.publishedAt) {
      return true
    }

    const issueTime = new Date(issue.publishedAt).getTime()
    return !Number.isNaN(issueTime) && issueTime <= now
  })

  if (publishedIssues.length === 0) {
    return null
  }

  return [...publishedIssues].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return right.sortOrder - left.sortOrder
    }

    const leftTime = left.publishedAt ? new Date(left.publishedAt).getTime() : 0
    const rightTime = right.publishedAt ? new Date(right.publishedAt).getTime() : 0
    return rightTime - leftTime
  })[0]
}

export default function ArticlePublisherPanel() {
  const router = useRouter()
  const [articles, setArticles] = useState<AdminArticleSummary[]>([])
  const [issues, setIssues] = useState<AdminIssueSummary[]>([])
  const [currentIssue, setCurrentIssue] = useState<AdminIssueSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [applyingArticleId, setApplyingArticleId] = useState('')
  const [confirmDeleteArticleId, setConfirmDeleteArticleId] = useState('')
  const [deletingArticleId, setDeletingArticleId] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState(ARTICLE_CATEGORIES[0])
  const [filterCategory, setFilterCategory] = useState(ARTICLE_CATEGORIES[0])
  const [issueId, setIssueId] = useState('')
  const [content, setContent] = useState('')
  const [publishNow, setPublishNow] = useState(true)
  const [selectedArticleTime, setSelectedArticleTime] = useState<SelectedArticleTime | null>(null)

  useEffect(() => {
    if (!slug) {
      setSlug(normalizeSlug(title))
    }
  }, [title, slug])

  const handleGuardFailure = (error?: string, fallbackMessage?: string) => {
    if (error === 'NOT_AUTHENTICATED') {
      router.replace(OPS_ROOM_ARTICLE_LOGIN_PATH)
      return true
    }

    if (fallbackMessage) {
      setMessage(fallbackMessage)
      setIsError(true)
    }

    return false
  }

  const loadPanelData = async () => {
    setLoading(true)

    const issuesResult = await getAdminIssues()

    if (!issuesResult.success) {
      handleGuardFailure(issuesResult.error, issuesResult.message)
      setLoading(false)
      return
    }

    const nextIssues = issuesResult.data ?? []
    const nextCurrentIssue = getAutoCurrentIssue(nextIssues)

    setIssues(nextIssues)
    setCurrentIssue(nextCurrentIssue)
    setIssueId((currentIssueId) => {
      if (currentIssueId && nextIssues.some((issue) => issue.id === currentIssueId)) {
        return currentIssueId
      }

      return getDefaultIssueId(nextIssues)
    })

    if (!nextCurrentIssue) {
      setArticles([])
      setSelectedArticleTime(null)
      setConfirmDeleteArticleId('')
      setLoading(false)
      return
    }

    const articlesResult = await getAdminArticles({
      issueId: nextCurrentIssue.id,
      category: filterCategory,
    })

    if (!articlesResult.success) {
      handleGuardFailure(articlesResult.error, articlesResult.message)
      setLoading(false)
      return
    }

    const nextArticles = articlesResult.data ?? []
    setArticles(nextArticles)
    setConfirmDeleteArticleId((currentDeleteId) =>
      nextArticles.some((article) => article.id === currentDeleteId) ? currentDeleteId : ''
    )
    setSelectedArticleTime((currentSelected) => {
      if (!currentSelected) {
        return null
      }

      return nextArticles.some(
        (article) =>
          article.id === currentSelected.articleId &&
          article.publishedAt === currentSelected.publishedAt
      )
        ? currentSelected
        : null
    })
    setLoading(false)
  }

  useEffect(() => {
    void loadPanelData()
  }, [filterCategory])

  const resetForm = () => {
    setTitle('')
    setSlug('')
    setAuthor('')
    setCategory(ARTICLE_CATEGORIES[0])
    setIssueId(getDefaultIssueId(issues))
    setContent('')
    setPublishNow(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPublishing(true)
    setMessage('')
    setIsError(false)

    const result = await createAdminArticle({
      title,
      slug,
      author,
      category,
      issueId,
      content,
      publishNow,
    })

    if (!result.success) {
      handleGuardFailure(result.error, result.message)
      setPublishing(false)
      return
    }

    setMessage(
      result.data?.slug
        ? `${result.message} 文章链接：/articles/${result.data.slug}`
        : result.message
    )
    setIsError(false)
    resetForm()
    await loadPanelData()
    setPublishing(false)
  }

  const handlePickArticleTimeLegacy = (article: AdminArticleSummary) => {
    if (!article.publishedAt) {
      setMessage('这篇文章还没有发布时间，暂时不能作为替换时间。')
      setIsError(true)
      return
    }

    setSelectedArticleTime({
      articleId: article.id,
      publishedAt: article.publishedAt,
      title: article.title,
    })
    setMessage(`已选中《${article.title}》的发布时间，可用于替换当前栏目的另一篇文章位置。`)
    setIsError(false)
  }

  const handleApplySelectedTimeLegacy = async (article: AdminArticleSummary) => {
    if (!selectedArticleTime) {
      return
    }

    setApplyingArticleId(article.id)
    setMessage('')
    setIsError(false)

    const result = await updateArticlePublishedAt(article.id, selectedArticleTime.publishedAt)

    if (!result.success) {
      handleGuardFailure(result.error, result.message)
      setApplyingArticleId('')
      return
    }

    setMessage(`已将《${selectedArticleTime.title}》的发布时间应用到《${article.title}》。`)
    setIsError(false)
    setSelectedArticleTime(null)
    await loadPanelData()
    setApplyingArticleId('')
  }

  const handlePickArticleTime = (article: AdminArticleSummary) => {
    if (!article.publishedAt) {
      setMessage('这篇文章还没有发布时间，暂时不能作为替换来源。')
      setIsError(true)
      return
    }

    setSelectedArticleTime({
      articleId: article.id,
      publishedAt: article.publishedAt,
      title: article.title,
    })
    setMessage(`已选中《${article.title}》作为旧文章。请先确认新文章已发布，再点它的“替换成这篇”。`)
    setIsError(false)
  }

  const handleApplySelectedTime = async (article: AdminArticleSummary) => {
    if (!selectedArticleTime) {
      return
    }

    setApplyingArticleId(article.id)
    setMessage('')
    setIsError(false)

    const result = await replaceAdminArticle(selectedArticleTime.articleId, article.id)

    if (!result.success) {
      handleGuardFailure(result.error, result.message)
      setApplyingArticleId('')
      return
    }

    setMessage(`已用《${article.title}》替换《${selectedArticleTime.title}》，旧文章已删除。`)
    setIsError(false)
    setSelectedArticleTime(null)
    await loadPanelData()
    setApplyingArticleId('')
  }

  const handleDeleteRequest = (articleId: string) => {
    setConfirmDeleteArticleId((currentArticleId) => (currentArticleId === articleId ? '' : articleId))
  }

  const handleDeleteArticleLegacy = async (article: AdminArticleSummary) => {
    setDeletingArticleId(article.id)
    setMessage('')
    setIsError(false)

    const result = await deleteAdminArticle(article.id)

    if (!result.success) {
      handleGuardFailure(result.error, result.message)
      setDeletingArticleId('')
      return
    }

    /*

    setMessage(`宸插垹闄ゃ€?${article.title}銆嬨€俙)
    setIsError(false)
    setConfirmDeleteArticleId('')
    setSelectedArticleTime((currentSelected) =>
      currentSelected?.articleId === article.id ? null : currentSelected
    )
    await loadPanelData()
    setDeletingArticleId('')
  }

    */
    setMessage(`Deleted: ${article.title}`)
    setIsError(false)
    setConfirmDeleteArticleId('')
    setSelectedArticleTime((currentSelected) =>
      currentSelected?.articleId === article.id ? null : currentSelected
    )
    await loadPanelData()
    setDeletingArticleId('')
  }

  const handleDeleteArticle = async (article: AdminArticleSummary) => {
    setDeletingArticleId(article.id)
    setMessage('')
    setIsError(false)

    const result = await deleteAdminArticle(article.id)

    if (!result.success) {
      handleGuardFailure(result.error, result.message)
      setDeletingArticleId('')
      return
    }

    setMessage(`Deleted: ${article.title}`)
    setIsError(false)
    setConfirmDeleteArticleId('')
    setSelectedArticleTime((currentSelected) =>
      currentSelected?.articleId === article.id ? null : currentSelected
    )
    await loadPanelData()
    setDeletingArticleId('')
  }

  const selectedIssue = issues.find((issue) => issue.id === issueId) ?? null

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="sticky top-0 z-10 border-b border-[#E8E4DF] bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/ops-room"
              className="inline-flex items-center gap-2 text-sm text-[#5D5D5D] transition-colors hover:text-[#3A3A3A]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-youyou">返回后台</span>
            </Link>
            <span className="text-[#D7CCC8]">|</span>
            <div>
              <h1 className="font-youyou text-lg text-[#3A3A3A]">总编辑发布台</h1>
              <p className="text-xs tracking-wide text-[#8D8D8D]">
                发稿时同时指定栏目与刊号
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadPanelData()}
            disabled={loading}
            className="rounded-lg p-2 text-[#5D5D5D] transition-colors hover:bg-[#F7F5F0] hover:text-[#3A3A3A] disabled:opacity-50"
            title="刷新"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-[#E8E4DF] bg-white/70 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-[#F7F5F0] p-3">
              <FilePlus2 className="h-5 w-5 text-[#A1887F]" />
            </div>
            <div>
              <h2 className="font-youyou text-2xl text-[#3A3A3A]">新建文章</h2>
              <p className="text-sm text-[#8D8D8D]">
                文章会直接写入 Supabase。刊号必选，这样首页、归档和后台记录才能保持一致。
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-youyou text-[#5D5D5D]">
                  标题
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  className="w-full rounded-xl border border-[#E8E4DF] bg-[#F7F5F0] px-4 py-3 text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
                  placeholder="文章标题"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-youyou text-[#5D5D5D]">
                  作者
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  required
                  className="w-full rounded-xl border border-[#E8E4DF] bg-[#F7F5F0] px-4 py-3 text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
                  placeholder="署名"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-[1fr_0.8fr_0.8fr]">
              <div>
                <label className="mb-2 block text-sm font-youyou text-[#5D5D5D]">
                  链接 slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(event) => setSlug(normalizeSlug(event.target.value))}
                  required
                  className="w-full rounded-xl border border-[#E8E4DF] bg-[#F7F5F0] px-4 py-3 text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
                  placeholder="auto-generated-slug"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-youyou text-[#5D5D5D]">
                  栏目
                </label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-xl border border-[#E8E4DF] bg-[#F7F5F0] px-4 py-3 text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
                >
                  {ARTICLE_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-youyou text-[#5D5D5D]">
                  所属刊号
                </label>
                <select
                  value={issueId}
                  onChange={(event) => setIssueId(event.target.value)}
                  required
                  className="w-full rounded-xl border border-[#E8E4DF] bg-[#F7F5F0] px-4 py-3 text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
                >
                  {issues.map((issue) => (
                    <option key={issue.id} value={issue.id}>
                      {issue.label} · {getIssueDisplayTitle(issue)}
                      {currentIssue?.id === issue.id ? '（当前刊）' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedIssue ? (
              <div className="rounded-2xl border border-[#E8E4DF] bg-[#F7F5F0] px-4 py-3 text-sm text-[#6A6A6A]">
                当前选择：{selectedIssue.label} · {getIssueDisplayTitle(selectedIssue)}
                {currentIssue?.id === selectedIssue.id ? '（当前刊）' : '（归档刊）'}
              </div>
            ) : (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                还没有可用刊号，请先在 Supabase 的 issues 表里创建刊号。
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-youyou text-[#5D5D5D]">
                正文
              </label>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                required
                rows={14}
                className="w-full rounded-3xl border border-[#E8E4DF] bg-[#F7F5F0] px-4 py-4 text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
                placeholder="粘贴最终成稿，支持纯文本，也可以直接填写 HTML。"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-[#E8E4DF] bg-[#F7F5F0] px-4 py-3 text-sm text-[#5D5D5D]">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(event) => setPublishNow(event.target.checked)}
                className="h-4 w-4 rounded border-[#D7CCC8] text-[#3A3A3A] focus:ring-[#A1887F]"
              />
              <span>立即发布到前台网站</span>
            </label>

            {message ? (
              <div
                className={`rounded-xl border px-4 py-3 text-sm font-youyou ${isError
                    ? 'border-red-100 bg-red-50 text-red-600'
                    : 'border-green-100 bg-green-50 text-green-600'
                  }`}
              >
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={publishing || !issueId}
              className="inline-flex items-center gap-2 rounded-full bg-[#3A3A3A] px-6 py-3 text-sm text-white transition-colors hover:bg-[#2A2A2A] disabled:bg-[#8D8D8D]"
            >
              {publishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FilePlus2 className="h-4 w-4" />
              )}
              <span className="font-youyou">
                {publishing ? '正在保存...' : publishNow ? '发布文章' : '保存草稿'}
              </span>
            </button>
          </form>
        </section>

        <aside className="rounded-3xl border border-[#E8E4DF] bg-white/70 p-6 backdrop-blur-sm">
          <div className="mb-5">
            <h2 className="font-youyou text-2xl text-[#3A3A3A]">当前期栏目文章</h2>
            <p className="mt-1 text-sm text-[#8D8D8D]">
              先选栏目，再从旧文章提取时间，应用到新文章上完成替换。
            </p>
          </div>

          <div className="mb-4 rounded-2xl border border-[#E8E4DF] bg-[#F7F5F0] px-4 py-3 text-sm text-[#6A6A6A]">
            {currentIssue ? (
              <>
                <p className="text-xs font-youyou uppercase tracking-[0.2em] text-[#8D8D8D]">当前期</p>
                <p className="mt-1 font-youyou text-base text-[#3A3A3A]">
                  {currentIssue.label} · {getIssueDisplayTitle(currentIssue)}
                </p>
              </>
            ) : (
              <p>当前还没有已上线的期刊，暂时无法按当前期筛选文章。</p>
            )}
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {ARTICLE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs transition-colors ${filterCategory === cat
                    ? 'bg-[#A1887F] text-white'
                    : 'bg-[#F7F5F0] text-[#5D5D5D] hover:bg-[#E8E4DF]'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {selectedArticleTime ? (
            <div className="mb-6 rounded-2xl border border-[#E7D7CD] bg-[#FCF8F5] p-4 text-sm text-[#6A6A6A]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-youyou uppercase tracking-[0.2em] text-[#A1887F]">
                    已选时间来源
                  </p>
                  <p className="mt-1 font-youyou text-base text-[#3A3A3A]">
                    《{selectedArticleTime.title}》
                  </p>
                  <p className="mt-1 text-xs text-[#8D8D8D]">
                    {formatDateTime(selectedArticleTime.publishedAt)}
                  </p>
                  <p className="mt-2 text-xs text-[#8D8D8D]">
                    选择另一篇已发布的新文章后，点击“替换成这篇”，旧文章会被自动删除。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedArticleTime(null)}
                  className="rounded-full border border-[#D7CCC8] px-3 py-1 text-xs text-[#7C746D] transition-colors hover:border-[#A1887F] hover:text-[#A1887F]"
                >
                  清除
                </button>
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="py-10 text-center text-sm text-[#8D8D8D]">
              正在读取当前期栏目文章...
            </div>
          ) : !currentIssue ? (
            <div className="py-10 text-center text-sm text-[#8D8D8D]">
              当前还没有可用的当前期文章。
            </div>
          ) : articles.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#8D8D8D]">
              当前期的“{filterCategory}”还没有文章。
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => {
                const isSelectedTimeSource = selectedArticleTime?.articleId === article.id
                const canApplySelectedTime = Boolean(
                  selectedArticleTime &&
                    selectedArticleTime.articleId !== article.id &&
                    article.isPublished
                )
                const isDeleteConfirming = confirmDeleteArticleId === article.id
                const isDeleting = deletingArticleId === article.id

                return (
                  <div
                    key={article.id}
                    className="rounded-2xl border border-[#E8E4DF] bg-[#F7F5F0] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-youyou text-lg text-[#3A3A3A]">{article.title}</p>
                        <p className="mt-1 text-sm text-[#8D8D8D]">
                          {article.author} · {article.category}
                          {article.issueLabel ? ` · ${article.issueLabel}` : ''}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-xs ${
                          article.isPublished
                            ? 'bg-green-50 text-green-600'
                            : 'bg-[#EFEBE9] text-[#7D7D7D]'
                        }`}
                      >
                        {article.isPublished ? '已发布' : '草稿'}
                      </span>
                    </div>

                    <div className="mt-3 space-y-3 border-t border-[#E8E4DF]/60 pt-3 text-sm text-[#6A6A6A]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-youyou text-[#5D5D5D]">发布时间</label>
                        <input
                          key={`article-published-at-${article.id}-${article.publishedAt ?? 'empty'}`}
                          type="datetime-local"
                          defaultValue={toDateTimeLocalValue(article.publishedAt)}
                          className="rounded-lg border border-[#E8E4DF] bg-white px-2 py-1 text-xs text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
                          onChange={async (e) => {
                            const val = e.target.value
                            const isoDate = val ? new Date(val).toISOString() : null
                            const result = await updateArticlePublishedAt(article.id, isoDate)

                            if (!result.success) {
                              handleGuardFailure(result.error, result.message)
                              return
                            }

                            setMessage('发布时间已更新。')
                            setIsError(false)
                            setSelectedArticleTime((currentSelected) => {
                              if (!currentSelected || currentSelected.articleId !== article.id) {
                                return currentSelected
                              }

                              if (!isoDate) {
                                return null
                              }

                              return {
                                ...currentSelected,
                                publishedAt: isoDate,
                              }
                            })
                            await loadPanelData()
                          }}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handlePickArticleTime(article)}
                          disabled={!article.publishedAt}
                          className={`rounded-full px-4 py-1.5 text-xs transition-colors ${
                            isSelectedTimeSource
                              ? 'bg-[#A1887F] text-white'
                              : 'bg-white text-[#5D5D5D] hover:bg-[#EFE7E2]'
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {isSelectedTimeSource ? '已选旧文章' : '选为旧文章'}
                        </button>

                        {canApplySelectedTime ? (
                          <button
                            type="button"
                            onClick={() => void handleApplySelectedTime(article)}
                            disabled={applyingArticleId === article.id}
                            className="rounded-full bg-[#3A3A3A] px-4 py-1.5 text-xs text-white transition-colors hover:bg-[#2A2A2A] disabled:bg-[#8D8D8D]"
                          >
                            {applyingArticleId === article.id ? '替换中...' : '替换成这篇'}
                          </button>
                        ) : null}

                        {isDeleteConfirming ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void handleDeleteArticle(article)}
                              disabled={isDeleting}
                              className="rounded-full bg-red-600 px-4 py-1.5 text-xs text-white transition-colors hover:bg-red-700 disabled:bg-red-300"
                            >
                              {isDeleting ? 'Deleting...' : '确认删除'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteArticleId('')}
                              disabled={isDeleting}
                              className="rounded-full border border-[#D7CCC8] px-4 py-1.5 text-xs text-[#7C746D] transition-colors hover:border-[#A1887F] hover:text-[#A1887F] disabled:opacity-50"
                            >
                              取消
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(article.id)}
                            className="rounded-full border border-red-200 px-4 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50"
                          >
                            删除文章
                          </button>
                        )}
                      </div>

                      {selectedArticleTime && selectedArticleTime.articleId !== article.id && !article.isPublished ? (
                        <p className="text-xs text-[#A1887F]">先发布这篇新文章，再执行替换。</p>
                      ) : null}

                      <div className="flex items-center justify-between text-xs text-[#8D8D8D]">
                        <span>链接：/articles/{article.slug}</span>
                        {article.issueSlug ? <span>专题：{article.issueLabel}</span> : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </aside>

        {/* Issue Scheduling Panel */}
        <section className="rounded-3xl border border-[#E8E4DF] bg-white/70 p-6 backdrop-blur-sm lg:col-span-2">
          <div className="mb-5">
            <h2 className="font-youyou text-2xl text-[#3A3A3A]">期刊上线调度</h2>
            <p className="mt-1 text-sm text-[#8D8D8D]">
              设置每期刊物的上线时间。到达时间后该期刊物和文章会自动在前台展示，无需手动切换。
            </p>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-[#8D8D8D]">正在读取期刊列表...</div>
          ) : issues.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#8D8D8D]">还没有期刊记录。</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {issues.map((issue) => {
                const isPublished = issue.publishedAt && new Date(issue.publishedAt) <= new Date()
                const isScheduled = issue.publishedAt && new Date(issue.publishedAt) > new Date()

                return (
                  <div
                    key={issue.id}
                    className={`rounded-2xl border p-5 transition-all ${isPublished
                        ? 'border-green-200 bg-green-50/50'
                        : isScheduled
                          ? 'border-amber-200 bg-amber-50/50'
                          : 'border-[#E8E4DF] bg-[#F7F5F0]'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-youyou text-lg text-[#3A3A3A]">
                        {issue.label} · {getIssueDisplayTitle(issue)}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${isPublished
                            ? 'bg-green-100 text-green-700'
                            : isScheduled
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-[#EFEBE9] text-[#7D7D7D]'
                          }`}
                      >
                        {isPublished ? '已上线' : isScheduled ? '定时中' : '未排期'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-youyou text-[#5D5D5D]">
                          上线时间
                        </label>
                        <input
                          key={`issue-published-at-${issue.id}-${issue.publishedAt ?? 'empty'}`}
                          type="datetime-local"
                          defaultValue={toDateTimeLocalValue(issue.publishedAt)}
                          className="w-full rounded-xl border border-[#E8E4DF] bg-white px-3 py-2 text-sm text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
                          onChange={async (e) => {
                            const val = e.target.value
                            if (!val) return
                            const isoDate = new Date(val).toISOString()
                            const result = await updateIssuePublishedAt(issue.id, isoDate)
                            if (result.success) {
                              await loadPanelData()
                            } else {
                              setMessage(result.message)
                              setIsError(true)
                            }
                          }}
                        />
                      </div>

                      {issue.publishedAt && (
                        <p className="text-xs text-[#8D8D8D]">
                          {isPublished
                            ? `已于 ${new Intl.DateTimeFormat('zh-CN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            }).format(new Date(issue.publishedAt))} 上线`
                            : `将于 ${new Intl.DateTimeFormat('zh-CN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            }).format(new Date(issue.publishedAt))} 自动上线`}
                        </p>
                      )}

                      {/* Cover Image Upload */}
                      <div className="border-t border-[#E8E4DF] pt-3 mt-1">
                        <label className="mb-1.5 block text-xs font-youyou text-[#5D5D5D]">
                          封面图片
                        </label>
                        {issue.coverImage && (
                          <img
                            src={issue.coverImage}
                            alt="封面预览"
                            className="w-full h-24 object-cover rounded-lg mb-2 border border-[#E8E4DF]"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full text-xs text-[#5D5D5D] file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-[#EFEBE9] file:text-[#5D5D5D] file:cursor-pointer hover:file:bg-[#E8E4DF] transition-all"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const fd = new FormData()
                            fd.append('file', file)
                            const result = await uploadIssueCoverImage(issue.id, fd)
                            if (result.success) {
                              setMessage('封面已上传！')
                              setIsError(false)
                              await loadPanelData()
                            } else {
                              setMessage(result.message)
                              setIsError(true)
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
