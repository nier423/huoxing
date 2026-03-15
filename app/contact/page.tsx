'use client'

import Link from 'next/link'
import { ArrowRight, Mail, PenSquare } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <Navbar />

      <div className="mx-auto max-w-3xl animate-fade-in px-4 pb-24 pt-32 md:px-8">
        <div className="space-y-12 text-center">
          <h1 className="font-youyou text-4xl tracking-[0.2em] text-[#3A3A3A] md:text-5xl">
            联系我们
          </h1>

          <div className="mx-auto h-[1px] w-16 bg-[#D7CCC8]" />

          <p className="mx-auto max-w-xl text-lg leading-loose text-[#5D5D5D]">
            无论是投稿、分享故事，还是单纯想写信给我们，都可以通过下面两个入口联系编辑部。在线投稿会把稿件作为附件直接发送到收稿邮箱。
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/submit"
              className="group relative overflow-hidden rounded-3xl border border-[#EFEBE9] bg-white p-10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)]"
            >
              <div className="absolute inset-0 paper-texture opacity-20" />
              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#D7CCC8]/50 bg-[#F7F5F0] transition-transform duration-500 group-hover:scale-110">
                  <PenSquare className="h-6 w-6 text-[#A1887F]" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-widest text-[#9E9E9E]">
                    在线投稿
                  </p>
                  <p className="font-youyou text-2xl text-[#3A3A3A]">打开投稿页面</p>
                </div>
                <div className="flex items-center gap-2 text-sm italic text-[#A1887F] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <span>发送附件给编辑部</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            <a
              href="mailto:xinghuo0308@outlook.com"
              className="group relative overflow-hidden rounded-3xl border border-[#EFEBE9] bg-white p-10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)]"
            >
              <div className="absolute inset-0 paper-texture opacity-20" />
              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#D7CCC8]/50 bg-[#F7F5F0] transition-transform duration-500 group-hover:scale-110">
                  <Mail className="h-6 w-6 text-[#A1887F]" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-widest text-[#9E9E9E]">
                    投稿邮箱
                  </p>
                  <p className="break-all font-serif text-xl text-[#3A3A3A] md:text-2xl">
                    xinghuo0308@outlook.com
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm italic text-[#A1887F] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <span>也可以继续用邮件投稿</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </a>
          </div>

          <div className="mt-16 space-y-4">
            <h3 className="font-youyou text-xl tracking-widest text-[#5D5D5D]">
              投稿指南
            </h3>
            <ul className="space-y-2 text-sm leading-relaxed text-[#757575] md:text-base">
              <li>在线投稿支持 PDF、Word（.doc/.docx）和 Markdown（.md）文件。</li>
              <li>单个附件请控制在 4.5MB 以内，便于编辑部直接在邮箱中查看。</li>
              <li>只有录用稿件才会由总编辑整理后上传到网站后台并发布。</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
