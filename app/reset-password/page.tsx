'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function parseHashParams() {
  if (typeof window === 'undefined') {
    return new URLSearchParams()
  }

  return new URLSearchParams(window.location.hash.replace(/^#/, ''))
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [canReset, setCanReset] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) {
      setMessage('服务配置缺失，请联系管理员。')
      setIsError(true)
      setLoading(false)
      return
    }

    const syncRecoveryState = async () => {
      const hashParams = parseHashParams()
      const hashError = hashParams.get('error_description')

      if (hashError) {
        setMessage(hashError)
        setIsError(true)
      }

      const hasRecoveryHash = Boolean(hashParams.get('access_token')) || hashParams.get('type') === 'recovery'

      let sessionResult = await supabase.auth.getSession()
      let session = sessionResult.data.session

      if (!session && hasRecoveryHash) {
        await new Promise((resolve) => window.setTimeout(resolve, 400))
        sessionResult = await supabase.auth.getSession()
        session = sessionResult.data.session
      }

      if (session) {
        setCanReset(true)
        setMessage('')
        setIsError(false)
      } else if (!hashError) {
        setCanReset(false)
        setMessage('重置链接无效或已过期，请重新申请找回密码。')
        setIsError(true)
      }

      setLoading(false)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || Boolean(session)) {
        setCanReset(Boolean(session))
        setMessage('')
        setIsError(false)
        setLoading(false)
      }
    })

    void syncRecoveryState()

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (password.length < 6) {
      setMessage('新密码至少需要 6 位字符。')
      setIsError(true)
      return
    }

    if (password !== confirmPassword) {
      setMessage('两次输入的密码不一致，请重新确认。')
      setIsError(true)
      return
    }

    const supabase = createClient()
    if (!supabase) {
      setMessage('服务配置缺失，请联系管理员。')
      setIsError(true)
      return
    }

    setSaving(true)
    setMessage('')
    setIsError(false)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      console.error('[updateUser] 重置密码失败:', error)
      setMessage(error.message || '密码更新失败，请稍后重试。')
      setIsError(true)
      setSaving(false)
      return
    }

    setPassword('')
    setConfirmPassword('')
    setMessage('密码已更新，正在返回首页。')
    setIsError(false)
    setSaving(false)

    window.setTimeout(() => {
      router.push('/')
      router.refresh()
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">
      <div className="p-6">
        <Link
          href="/login"
          className="inline-flex items-center space-x-2 text-[#5D5D5D] hover:text-[#3A3A3A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-youyou text-sm">返回登录</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="font-youyou text-4xl tracking-widest text-[#3A3A3A] mb-3">星火</h1>
            <p className="text-[#8D8D8D] font-youyou text-sm tracking-wide">设置新的登录密码</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-[#E8E4DF]">
            <div className="mb-8 rounded-2xl bg-[#F7F5F0] px-4 py-4">
              <div className="flex items-center space-x-3 text-[#3A3A3A]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#A1887F]">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-youyou">重置密码</p>
                  <p className="mt-1 text-xs text-[#8D8D8D] font-youyou">
                    请输入一个新的密码，保存后即可使用新密码登录
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10 text-[#8D8D8D]">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span className="font-youyou text-sm">正在验证重置链接...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-youyou text-[#5D5D5D] mb-2">
                    新密码 <span className="text-[#A1887F]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="至少 6 位字符"
                      required
                      minLength={6}
                      disabled={!canReset || saving}
                      className="w-full px-4 py-3 pr-11 bg-[#F7F5F0] border border-[#E8E4DF] rounded-xl text-[#3A3A3A] placeholder-[#BCAAA4] focus:outline-none focus:border-[#A1887F] focus:ring-1 focus:ring-[#A1887F]/20 transition-all disabled:cursor-not-allowed disabled:bg-[#F1ECE6]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8D8D8D] hover:text-[#5D5D5D] transition-colors disabled:cursor-not-allowed"
                      disabled={!canReset || saving}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-youyou text-[#5D5D5D] mb-2">
                    确认新密码 <span className="text-[#A1887F]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="再次输入新密码"
                      required
                      minLength={6}
                      disabled={!canReset || saving}
                      className="w-full px-4 py-3 pr-11 bg-[#F7F5F0] border border-[#E8E4DF] rounded-xl text-[#3A3A3A] placeholder-[#BCAAA4] focus:outline-none focus:border-[#A1887F] focus:ring-1 focus:ring-[#A1887F]/20 transition-all disabled:cursor-not-allowed disabled:bg-[#F1ECE6]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8D8D8D] hover:text-[#5D5D5D] transition-colors disabled:cursor-not-allowed"
                      disabled={!canReset || saving}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

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

                <button
                  type="submit"
                  disabled={!canReset || saving}
                  className="w-full py-3.5 bg-[#3A3A3A] hover:bg-[#2A2A2A] disabled:bg-[#8D8D8D] text-white font-youyou tracking-wider rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="inline-flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>保存中...</span>
                    </span>
                  ) : (
                    '保存新密码'
                  )}
                </button>
              </form>
            )}

            {!loading && !canReset && (
              <p className="mt-6 text-center text-sm text-[#8D8D8D] font-youyou">
                需要重新获取邮件链接？
                <Link
                  href="/login?mode=forgot"
                  className="ml-1 text-[#A1887F] hover:text-[#8D6E63] transition-colors"
                >
                  去找回密码
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
