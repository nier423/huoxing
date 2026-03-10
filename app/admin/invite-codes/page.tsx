'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  RefreshCw,
  Sparkles,
  Users,
  Gift
} from 'lucide-react'
import { 
  getInviteCodes, 
  createInviteCodes, 
  deleteInviteCode,
  getInviteCodeStats,
  type InviteCode 
} from '@/app/actions/invite-codes'

export default function AdminInviteCodesPage() {
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [stats, setStats] = useState({ total: 0, used: 0, available: 0 })
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generateCount, setGenerateCount] = useState(1)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState<'all' | 'available' | 'used'>('all')

  // 加载数据
  const loadData = async () => {
    setLoading(true)
    const [codesResult, statsResult] = await Promise.all([
      getInviteCodes(),
      getInviteCodeStats(),
    ])

    if (codesResult.success && codesResult.data) {
      setCodes(codesResult.data)
    }
    if (statsResult.success && statsResult.data) {
      setStats(statsResult.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // 复制邀请码
  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // 生成新邀请码
  const handleGenerate = async () => {
    setGenerating(true)
    setMessage('')
    const result = await createInviteCodes(generateCount)
    
    if (result.success) {
      setMessage(`成功生成 ${result.data?.length || 0} 个邀请码`)
      loadData()
    } else {
      setMessage(result.message)
    }
    setGenerating(false)
  }

  // 删除邀请码
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个邀请码吗？')) return
    
    const result = await deleteInviteCode(id)
    if (result.success) {
      loadData()
    } else {
      alert(result.message)
    }
  }

  // 过滤邀请码
  const filteredCodes = codes.filter(code => {
    if (filter === 'available') return !code.is_used
    if (filter === 'used') return code.is_used
    return true
  })

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* 顶部导航 */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-[#E8E4DF] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="inline-flex items-center space-x-2 text-[#5D5D5D] hover:text-[#3A3A3A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-youyou text-sm">返回首页</span>
            </Link>
            <span className="text-[#D7CCC8]">|</span>
            <h1 className="font-youyou text-lg text-[#3A3A3A]">邀请码管理</h1>
          </div>
          
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 text-[#5D5D5D] hover:text-[#3A3A3A] hover:bg-[#F7F5F0] rounded-lg transition-colors disabled:opacity-50"
            title="刷新"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-[#E8E4DF]">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-[#F7F5F0] rounded-lg">
                <Gift className="w-4 h-4 text-[#A1887F]" />
              </div>
              <span className="text-sm text-[#8D8D8D] font-youyou">总数</span>
            </div>
            <p className="text-2xl font-semibold text-[#3A3A3A]">{stats.total}</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-[#E8E4DF]">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Sparkles className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-[#8D8D8D] font-youyou">可用</span>
            </div>
            <p className="text-2xl font-semibold text-green-600">{stats.available}</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-[#E8E4DF]">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-[#F7F5F0] rounded-lg">
                <Users className="w-4 h-4 text-[#8D8D8D]" />
              </div>
              <span className="text-sm text-[#8D8D8D] font-youyou">已使用</span>
            </div>
            <p className="text-2xl font-semibold text-[#8D8D8D]">{stats.used}</p>
          </div>
        </div>

        {/* 生成新邀请码 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-[#E8E4DF] mb-8">
          <h2 className="font-youyou text-[#3A3A3A] mb-4">生成新邀请码</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-[#5D5D5D] font-youyou">数量：</label>
              <select
                value={generateCount}
                onChange={(e) => setGenerateCount(Number(e.target.value))}
                className="px-3 py-2 bg-[#F7F5F0] border border-[#E8E4DF] rounded-lg text-[#3A3A3A] focus:outline-none focus:border-[#A1887F]"
              >
                {[1, 5, 10, 20].map(n => (
                  <option key={n} value={n}>{n} 个</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#3A3A3A] hover:bg-[#2A2A2A] disabled:bg-[#8D8D8D] text-white font-youyou text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{generating ? '生成中...' : '生成'}</span>
            </button>
            
            {message && (
              <span className="text-sm text-green-600 font-youyou">{message}</span>
            )}
          </div>
        </div>

        {/* 筛选和列表 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-[#E8E4DF] overflow-hidden">
          {/* 筛选栏 */}
          <div className="px-6 py-4 border-b border-[#E8E4DF] flex items-center justify-between">
            <h2 className="font-youyou text-[#3A3A3A]">邀请码列表</h2>
            <div className="flex items-center space-x-2">
              {(['all', 'available', 'used'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-youyou rounded-full transition-colors ${
                    filter === f
                      ? 'bg-[#3A3A3A] text-white'
                      : 'text-[#5D5D5D] hover:bg-[#F7F5F0]'
                  }`}
                >
                  {f === 'all' ? '全部' : f === 'available' ? '可用' : '已使用'}
                </button>
              ))}
            </div>
          </div>

          {/* 列表 */}
          {loading ? (
            <div className="px-6 py-12 text-center text-[#8D8D8D] font-youyou">
              加载中...
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#8D8D8D] font-youyou">
              暂无邀请码
            </div>
          ) : (
            <div className="divide-y divide-[#E8E4DF]">
              {filteredCodes.map((code) => (
                <div 
                  key={code.id} 
                  className="px-6 py-4 flex items-center justify-between hover:bg-[#F7F5F0]/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {/* 邀请码 */}
                    <code className={`font-mono text-lg tracking-widest ${
                      code.is_used ? 'text-[#BCAAA4] line-through' : 'text-[#3A3A3A]'
                    }`}>
                      {code.code}
                    </code>
                    
                    {/* 状态标签 */}
                    <span className={`px-2 py-0.5 text-xs font-youyou rounded-full ${
                      code.is_used 
                        ? 'bg-[#F7F5F0] text-[#8D8D8D]' 
                        : 'bg-green-50 text-green-600'
                    }`}>
                      {code.is_used ? '已使用' : '可用'}
                    </span>
                    
                    {/* 使用者信息 */}
                    {code.is_used && code.used_by_email && (
                      <span className="text-xs text-[#8D8D8D] font-youyou">
                        被 {code.used_by_email} 使用
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* 复制按钮 */}
                    {!code.is_used && (
                      <button
                        onClick={() => copyCode(code.code, code.id)}
                        className="p-2 text-[#5D5D5D] hover:text-[#3A3A3A] hover:bg-[#F7F5F0] rounded-lg transition-colors"
                        title="复制"
                      >
                        {copiedId === code.id ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    
                    {/* 删除按钮（仅未使用的可删除） */}
                    {!code.is_used && (
                      <button
                        onClick={() => handleDelete(code.id)}
                        className="p-2 text-[#BCAAA4] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="mt-8 p-6 bg-[#F7F5F0] rounded-xl border border-[#E8E4DF]">
          <h3 className="font-youyou text-[#3A3A3A] mb-3">使用说明</h3>
          <ul className="space-y-2 text-sm text-[#5D5D5D] font-youyou">
            <li>• 点击邀请码右侧的复制按钮，即可复制到剪贴板</li>
            <li>• 每个邀请码只能使用一次，使用后将自动标记</li>
            <li>• 已使用的邀请码不能删除，可作为用户注册记录</li>
            <li>• 建议定期生成新邀请码，控制社区增长节奏</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
