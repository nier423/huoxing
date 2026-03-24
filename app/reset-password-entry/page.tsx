import Link from 'next/link'
import { ArrowLeft, LockKeyhole } from 'lucide-react'

interface ResetPasswordEntryPageProps {
  searchParams?: {
    token_hash?: string
    type?: string
  }
}

function buildCallbackHref(tokenHash: string, type: string) {
  const params = new URLSearchParams({
    token_hash: tokenHash,
    type,
  })

  return `/auth/callback?${params.toString()}`
}

export default function ResetPasswordEntryPage({
  searchParams,
}: ResetPasswordEntryPageProps) {
  const tokenHash = searchParams?.token_hash
  const type = searchParams?.type
  const canContinue = Boolean(tokenHash && type)

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">
      <div className="p-6">
        <Link
          href="/login?mode=forgot"
          className="inline-flex items-center space-x-2 text-[#5D5D5D] hover:text-[#3A3A3A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-youyou text-sm">返回找回密码</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="font-youyou text-4xl tracking-widest text-[#3A3A3A] mb-3">星火</h1>
            <p className="text-[#8D8D8D] font-youyou text-sm tracking-wide">继续重置密码</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-[#E8E4DF]">
            <div className="mb-8 rounded-2xl bg-[#F7F5F0] px-4 py-4">
              <div className="flex items-center space-x-3 text-[#3A3A3A]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#A1887F]">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-youyou">确认进入重置流程</p>
                  <p className="mt-1 text-xs text-[#8D8D8D] font-youyou">
                    请点击下方按钮，继续完成密码重置
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[#5D5D5D] font-youyou">
              为避免邮箱安全扫描提前消耗一次性链接，我们将验证步骤放在站内按钮之后。点击按钮后，您将进入新密码设置页面。
            </p>

            {canContinue ? (
              <Link
                href={buildCallbackHref(tokenHash!, type!)}
                className="mt-8 block w-full py-3.5 bg-[#3A3A3A] hover:bg-[#2A2A2A] text-center text-white font-youyou tracking-wider rounded-xl transition-all duration-300"
              >
                继续重置密码
              </Link>
            ) : (
              <>
                <div className="mt-8 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 font-youyou">
                  当前链接缺少必要参数，请重新申请找回密码邮件。
                </div>
                <Link
                  href="/login?mode=forgot"
                  className="mt-6 block text-center text-sm text-[#A1887F] hover:text-[#8D6E63] transition-colors font-youyou"
                >
                  返回找回密码
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
