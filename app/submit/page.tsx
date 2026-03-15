import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Mail, PenSquare } from 'lucide-react'
import Navbar from '@/components/Navbar'
import SubmissionForm from '@/components/submit/submission-form'

export const metadata: Metadata = {
  title: '在线投稿 | 星火',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 pb-24 pt-32 md:px-8">
        <div className="mb-8">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm text-[#5D5D5D] transition-colors hover:text-[#A1887F]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-youyou">返回联系页面</span>
          </Link>
        </div>

        <div className="rounded-[2rem] border border-[#E8E4DF] bg-white/70 px-6 py-8 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.18)] backdrop-blur-sm md:px-10 md:py-10">
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm tracking-[0.25em] text-[#A1887F]">ONLINE SUBMISSION</p>
              <h1 className="font-youyou text-4xl text-[#3A3A3A] md:text-5xl">
                在线投稿
              </h1>
              <p className="mt-4 text-base leading-8 text-[#5D5D5D]">
                稿件会作为邮件附件直接发送到编辑部邮箱。未录用稿件不会写入网站数据库，只有总编辑在后台整理并发布后的文章，才会同步显示在网站前台。
              </p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-[#E8E4DF] bg-[#F7F5F0] p-4 text-sm text-[#5D5D5D] md:min-w-[260px]">
              <div className="flex items-center gap-2">
                <PenSquare className="h-4 w-4 text-[#A1887F]" />
                <span>支持 PDF / DOC / DOCX / Markdown</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#A1887F]" />
                <span>稿件直接发送到编辑部邮箱</span>
              </div>
              <p className="text-[#8D8D8D]">请将单个附件控制在 4.5MB 以内。</p>
            </div>
          </div>

          <SubmissionForm />
        </div>
      </div>
    </main>
  )
}
