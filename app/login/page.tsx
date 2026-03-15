'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signInWithEmail, signUpWithCode } from '@/app/actions/auth'
import { ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react'

type AuthMode = 'login' | 'register'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // 表单数据
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const redirectTo = (() => {
    const candidate = searchParams.get('redirectTo')
    return candidate?.startsWith('/') ? candidate : '/'
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      if (mode === 'login') {
        const result = await signInWithEmail({ email, password })
        if (result.success) {
          setMessage(result.message)
          setIsError(false)
          router.push(redirectTo)
          router.refresh()
        } else {
          setMessage(result.message)
          setIsError(true)
        }
      } else {
        const result = await signUpWithCode({ 
          email, 
          password, 
          inviteCode,
          displayName: displayName || undefined 
        })
        if (result.success) {
          setMessage(result.message + ' 请登录以继续。')
          setIsError(false)
          // 注册成功后切换到登录模式
          setMode('login')
          setInviteCode('')
          setDisplayName('')
        } else {
          setMessage(result.message)
          setIsError(true)
        }
      }
    } catch (error) {
      setMessage('发生未知错误，请稍后重试')
      setIsError(true)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setMessage('')
    setIsError(false)
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">
      {/* 返回首页 */}
      <div className="p-6">
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-[#5D5D5D] hover:text-[#3A3A3A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-youyou text-sm">返回首页</span>
        </Link>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-10">
            <h1 className="font-youyou text-4xl tracking-widest text-[#3A3A3A] mb-3">
              星火
            </h1>
            <p className="text-[#8D8D8D] font-youyou text-sm tracking-wide">
              {mode === 'login' ? '欢迎回来' : '加入我们，点燃星火'}
            </p>
          </div>

          {/* 表单卡片 */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-[#E8E4DF]">
            {/* 模式切换 */}
            <div className="flex mb-8 bg-[#F7F5F0] rounded-full p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 text-sm font-youyou tracking-wide rounded-full transition-all duration-300 ${
                  mode === 'login'
                    ? 'bg-white text-[#3A3A3A] shadow-sm'
                    : 'text-[#8D8D8D] hover:text-[#5D5D5D]'
                }`}
              >
                登录
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2.5 text-sm font-youyou tracking-wide rounded-full transition-all duration-300 ${
                  mode === 'register'
                    ? 'bg-white text-[#3A3A3A] shadow-sm'
                    : 'text-[#8D8D8D] hover:text-[#5D5D5D]'
                }`}
              >
                注册
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 邀请码（仅注册时显示） */}
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-youyou text-[#5D5D5D] mb-2">
                    邀请码 <span className="text-[#A1887F]">*</span>
                  </label>
                  <div className="relative">
                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1887F]" />
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="XXXX-XXXX"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-[#F7F5F0] border border-[#E8E4DF] rounded-xl text-[#3A3A3A] placeholder-[#BCAAA4] focus:outline-none focus:border-[#A1887F] focus:ring-1 focus:ring-[#A1887F]/20 transition-all font-mono tracking-widest text-center"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-[#8D8D8D] font-youyou">
                    星火社区采用邀请制，请输入您的专属邀请码
                  </p>
                </div>
              )}

              {/* 显示名称（仅注册时显示） */}
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-youyou text-[#5D5D5D] mb-2">
                    笔名 <span className="text-[#8D8D8D] text-xs">（选填）</span>
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="您希望如何被称呼"
                    className="w-full px-4 py-3 bg-[#F7F5F0] border border-[#E8E4DF] rounded-xl text-[#3A3A3A] placeholder-[#BCAAA4] focus:outline-none focus:border-[#A1887F] focus:ring-1 focus:ring-[#A1887F]/20 transition-all font-youyou"
                  />
                </div>
              )}

              {/* 邮箱 */}
              <div>
                <label className="block text-sm font-youyou text-[#5D5D5D] mb-2">
                  邮箱 <span className="text-[#A1887F]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 bg-[#F7F5F0] border border-[#E8E4DF] rounded-xl text-[#3A3A3A] placeholder-[#BCAAA4] focus:outline-none focus:border-[#A1887F] focus:ring-1 focus:ring-[#A1887F]/20 transition-all"
                />
              </div>

              {/* 密码 */}
              <div>
                <label className="block text-sm font-youyou text-[#5D5D5D] mb-2">
                  密码 <span className="text-[#A1887F]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? '至少 6 位字符' : '输入密码'}
                    required
                    minLength={mode === 'register' ? 6 : undefined}
                    className="w-full px-4 py-3 pr-11 bg-[#F7F5F0] border border-[#E8E4DF] rounded-xl text-[#3A3A3A] placeholder-[#BCAAA4] focus:outline-none focus:border-[#A1887F] focus:ring-1 focus:ring-[#A1887F]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8D8D8D] hover:text-[#5D5D5D] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 消息提示 */}
              {message && (
                <div
                  className={`p-3 rounded-xl text-sm font-youyou ${
                    isError
                      ? 'bg-red-50 text-red-600 border border-red-100'
                      : 'bg-green-50 text-green-600 border border-green-100'
                  }`}
                >
                  {message}
                </div>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#3A3A3A] hover:bg-[#2A2A2A] disabled:bg-[#8D8D8D] text-white font-youyou tracking-wider rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>处理中...</span>
                  </span>
                ) : mode === 'login' ? (
                  '登录'
                ) : (
                  '注册'
                )}
              </button>
            </form>

            {/* 切换模式 */}
            <p className="mt-6 text-center text-sm text-[#8D8D8D] font-youyou">
              {mode === 'login' ? '还没有账号？' : '已有账号？'}
              <button
                type="button"
                onClick={switchMode}
                className="ml-1 text-[#A1887F] hover:text-[#8D6E63] transition-colors"
              >
                {mode === 'login' ? '立即注册' : '立即登录'}
              </button>
            </p>
          </div>

          {/* 底部说明 */}
          <p className="mt-8 text-center text-xs text-[#BCAAA4] font-youyou leading-relaxed">
            星火是一个仅限邀请的私密社区
            <br />
            我们珍视每一位成员的声音
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  )
}
