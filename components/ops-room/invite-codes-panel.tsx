'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  Copy,
  Gift,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react'
import {
  createInviteCodes,
  deleteInviteCode,
  getInviteCodes,
  getInviteCodeStats,
  type InviteCode,
} from '@/app/actions/invite-codes'

type Filter = 'all' | 'available' | 'used'
type MessageTone = 'error' | 'success'

const OPS_ROOM_LOGIN_PATH = '/login?redirectTo=%2Fops-room'

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

export default function InviteCodesPanel() {
  const router = useRouter()
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [stats, setStats] = useState({ total: 0, used: 0, available: 0 })
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generateCount, setGenerateCount] = useState(5)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<MessageTone>('success')
  const [filter, setFilter] = useState<Filter>('all')

  const handleGuardFailure = (error?: string, fallbackMessage?: string) => {
    if (error === 'NOT_AUTHENTICATED') {
      router.replace(OPS_ROOM_LOGIN_PATH)
      return true
    }

    if (fallbackMessage) {
      setMessage(fallbackMessage)
      setMessageTone('error')
    }

    return false
  }

  const loadData = async () => {
    setLoading(true)
    setMessage('')

    const [codesResult, statsResult] = await Promise.all([
      getInviteCodes(),
      getInviteCodeStats(),
    ])

    if (!codesResult.success) {
      handleGuardFailure(codesResult.error, codesResult.message)
    } else if (codesResult.data) {
      setCodes(codesResult.data)
    }

    if (!statsResult.success) {
      handleGuardFailure(statsResult.error, statsResult.message)
    } else if (statsResult.data) {
      setStats(statsResult.data)
    }

    setLoading(false)
  }

  useEffect(() => {
    void loadData()
  }, [])

  const copyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedId(id)
      setMessage('邀请码已复制到剪贴板。')
      setMessageTone('success')
      window.setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setMessage('复制失败，请手动复制。')
      setMessageTone('error')
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setMessage('')

    const result = await createInviteCodes(generateCount)
    if (!result.success) {
      handleGuardFailure(result.error, result.message)
      setGenerating(false)
      return
    }

    setMessage(result.message)
    setMessageTone('success')
    await loadData()
    setGenerating(false)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个未使用的邀请码吗？')) {
      return
    }

    const result = await deleteInviteCode(id)
    if (!result.success) {
      handleGuardFailure(result.error, result.message)
      return
    }

    setMessage('邀请码已删除。')
    setMessageTone('success')
    await loadData()
  }

  const filteredCodes = codes.filter((code) => {
    if (filter === 'available') return !code.is_used
    if (filter === 'used') return code.is_used
    return true
  })

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="sticky top-0 z-10 border-b border-[#E8E4DF] bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[#5D5D5D] transition-colors hover:text-[#3A3A3A]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-youyou">返回首页</span>
            </Link>
            <span className="text-[#D7CCC8]">|</span>
            <div>
              <h1 className="font-youyou text-lg text-[#3A3A3A]">操作室</h1>
              <div className="mt-1 flex items-center gap-3 text-xs tracking-wide text-[#8D8D8D]">
                <span>邀请码使用情况</span>
                <span className="text-[#D7CCC8]">·</span>
                <Link
                  href="/ops-room/articles"
                  className="text-[#A1887F] transition-colors hover:text-[#8D6E63]"
                >
                  总编辑发布台
                </Link>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="rounded-lg p-2 text-[#5D5D5D] transition-colors hover:bg-[#F7F5F0] hover:text-[#3A3A3A] disabled:opacity-50"
            title="刷新"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#E8E4DF] bg-white/60 p-5 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-[#F7F5F0] p-2">
                <Gift className="h-4 w-4 text-[#A1887F]" />
              </div>
              <span className="font-youyou text-sm text-[#8D8D8D]">总数</span>
            </div>
            <p className="text-2xl font-semibold text-[#3A3A3A]">{stats.total}</p>
          </div>

          <div className="rounded-2xl border border-[#E8E4DF] bg-white/60 p-5 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2">
                <Sparkles className="h-4 w-4 text-green-600" />
              </div>
              <span className="font-youyou text-sm text-[#8D8D8D]">未使用</span>
            </div>
            <p className="text-2xl font-semibold text-green-600">
              {stats.available}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8E4DF] bg-white/60 p-5 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-[#F7F5F0] p-2">
                <Users className="h-4 w-4 text-[#8D8D8D]" />
              </div>
              <span className="font-youyou text-sm text-[#8D8D8D]">已使用</span>
            </div>
            <p className="text-2xl font-semibold text-[#8D8D8D]">{stats.used}</p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-[#E8E4DF] bg-white/60 p-6 backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-youyou text-[#3A3A3A]">生成邀请码</h2>
              <p className="mt-1 text-sm text-[#8D8D8D]">
                直接写入 Supabase 的 `invite_codes` 表。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={generateCount}
                onChange={(event) => setGenerateCount(Number(event.target.value))}
                className="rounded-lg border border-[#E8E4DF] bg-[#F7F5F0] px-3 py-2 text-[#3A3A3A] outline-none transition-colors focus:border-[#A1887F]"
              >
                {[1, 5, 10, 20].map((value) => (
                  <option key={value} value={value}>
                    {value} 个
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-lg bg-[#3A3A3A] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#2A2A2A] disabled:bg-[#8D8D8D]"
              >
                <Plus className="h-4 w-4" />
                <span className="font-youyou">
                  {generating ? '生成中...' : '生成邀请码'}
                </span>
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm font-youyou ${
                messageTone === 'error'
                  ? 'border-red-100 bg-red-50 text-red-600'
                  : 'border-green-100 bg-green-50 text-green-600'
              }`}
            >
              {message}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E8E4DF] bg-white/60 backdrop-blur-sm">
          <div className="flex flex-col gap-4 border-b border-[#E8E4DF] px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-youyou text-[#3A3A3A]">邀请码明细</h2>
              <p className="mt-1 text-sm text-[#8D8D8D]">
                每次刷新都会从 Supabase 读取最新状态。
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'available', 'used'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-full px-3 py-1.5 text-xs font-youyou transition-colors ${
                    filter === item
                      ? 'bg-[#3A3A3A] text-white'
                      : 'text-[#5D5D5D] hover:bg-[#F7F5F0]'
                  }`}
                >
                  {item === 'all'
                    ? '全部'
                    : item === 'available'
                      ? '未使用'
                      : '已使用'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-14 text-center font-youyou text-[#8D8D8D]">
              正在读取邀请码数据...
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="px-6 py-14 text-center font-youyou text-[#8D8D8D]">
              当前没有符合条件的邀请码。
            </div>
          ) : (
            <div className="divide-y divide-[#E8E4DF]">
              {filteredCodes.map((code) => (
                <div
                  key={code.id}
                  className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-[#F7F5F0]/60 md:flex-row md:items-start md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <code
                        className={`font-mono text-lg tracking-[0.25em] ${
                          code.is_used
                            ? 'text-[#BCAAA4] line-through'
                            : 'text-[#3A3A3A]'
                        }`}
                      >
                        {code.code}
                      </code>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-youyou ${
                          code.is_used
                            ? 'bg-[#F7F5F0] text-[#8D8D8D]'
                            : 'bg-green-50 text-green-600'
                        }`}
                      >
                        {code.is_used ? '已使用' : '未使用'}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-[#6A6A6A] md:grid-cols-2">
                      <p>创建时间：{formatDateTime(code.created_at)}</p>
                      <p>使用时间：{formatDateTime(code.used_at)}</p>
                      <p className="md:col-span-2">
                        使用账号：{code.used_by_email || '未使用'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!code.is_used && (
                      <button
                        type="button"
                        onClick={() => void copyCode(code.code, code.id)}
                        className="rounded-lg p-2 text-[#5D5D5D] transition-colors hover:bg-[#F7F5F0] hover:text-[#3A3A3A]"
                        title="复制邀请码"
                      >
                        {copiedId === code.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    )}

                    {!code.is_used && (
                      <button
                        type="button"
                        onClick={() => void handleDelete(code.id)}
                        className="rounded-lg p-2 text-[#BCAAA4] transition-colors hover:bg-red-50 hover:text-red-500"
                        title="删除邀请码"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
