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
                  <span>进入投稿页</span>
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
                  <span>发送邮件</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
