'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FilePlus2, Loader2, RefreshCw } from 'lucide-react'
import {
  createAdminArticle,
  getAdminArticles,
} from '@/app/actions/articles-admin'

interface AdminArticleSummary {
  author: string
  category: string
  id: string
  isPublished: boolean
  publishedAt: string | null
  slug: string
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

function normalizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fff-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function ArticlePublisherPanel() {
  const router = useRouter()
  const [articles, setArticles] = useState<AdminArticleSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState(ARTICLE_CATEGORIES[0])
  const [content, setContent] = useState('')
  const [publishNow, setPublishNow] = useState(true)

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

  const loadArticles = async () => {
    setLoading(true)
    const result = await getAdminArticles()

    if (!result.success) {
      handleGuardFailure(result.error, result.message)
      setLoading(false)
      return
    }

    setArticles(result.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void loadArticles()
  }, [])

  const resetForm = () => {
    setTitle('')
    setSlug('')
    setAuthor('')
    setCategory(ARTICLE_CATEGORIES[0])
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
    await loadArticles()
    setPublishing(false)
  }

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
              <span className="font-youyou">返回邀请码后台</span>
            </Link>
            <span className="text-[#D7CCC8]">|</span>
            <div>
              <h1 className="font-youyou text-lg text-[#3A3A3A]">总编辑发布台</h1>
              <p className="text-xs tracking-wide text-[#8D8D8D]">录用文章发布</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadArticles()}
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
                在这里填写最终成稿。保存后会直接写入 Supabase，勾选“立即发布”时会同步显示到前台网站。
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

            <div className="grid gap-5 md:grid-cols-[1fr_0.8fr]">
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
            </div>

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
                placeholder="粘贴最终成稿。支持纯文本，也可以直接填写 HTML。"
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

            {message && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm font-youyou ${
                  isError
                    ? 'border-red-100 bg-red-50 text-red-600'
                    : 'border-green-100 bg-green-50 text-green-600'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={publishing}
              className="inline-flex items-center gap-2 rounded-full bg-[#3A3A3A] px-6 py-3 text-sm text-white transition-colors hover:bg-[#2A2A2A] disabled:bg-[#8D8D8D]"
            >
              {publishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FilePlus2 className="h-4 w-4" />
              )}
              <span className="font-youyou">
                {publishing ? '保存中...' : publishNow ? '发布文章' : '保存草稿'}
              </span>
            </button>
          </form>
        </section>

        <aside className="rounded-3xl border border-[#E8E4DF] bg-white/70 p-6 backdrop-blur-sm">
          <div className="mb-5">
            <h2 className="font-youyou text-2xl text-[#3A3A3A]">最近文章</h2>
            <p className="mt-1 text-sm text-[#8D8D8D]">
              用来确认最近发布或保存的内容。
            </p>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-[#8D8D8D]">正在读取文章列表...</div>
          ) : articles.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#8D8D8D]">还没有文章记录。</div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="rounded-2xl border border-[#E8E4DF] bg-[#F7F5F0] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-youyou text-lg text-[#3A3A3A]">{article.title}</p>
                      <p className="mt-1 text-sm text-[#8D8D8D]">
                        {article.author} · {article.category}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        article.isPublished
                          ? 'bg-green-50 text-green-600'
                          : 'bg-[#EFEBE9] text-[#7D7D7D]'
                      }`}
                    >
                      {article.isPublished ? '已发布' : '草稿'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-[#6A6A6A]">
                    <p>链接：/articles/{article.slug}</p>
                    <p>时间：{formatDateTime(article.publishedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
