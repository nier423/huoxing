"use client";

import Navbar from "@/components/Navbar";
import { Mail, ArrowRight } from "lucide-react";

export default function Contact() {
  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <Navbar />
      
      <div className="pt-32 pb-24 px-4 md:px-8 max-w-3xl mx-auto animate-fade-in">
        <div className="text-center space-y-12">
          <h1 className="font-youyou text-4xl md:text-5xl text-[#3A3A3A] tracking-[0.2em]">
            联系我们
          </h1>
          
          <div className="w-16 h-[1px] bg-[#D7CCC8] mx-auto" />
          
          <p className="font-serif text-[#5D5D5D] text-lg leading-loose max-w-xl mx-auto">
            无论是想要投稿、分享故事，<br />
            还是只是想和我们说说话，<br />
            都欢迎写信给我们。
          </p>

          <div className="bg-white p-12 md:p-16 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] rounded-sm border border-[#EFEBE9] mt-16 relative overflow-hidden group hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] transition-all duration-500">
             {/* Paper Texture Overlay */}
             <div className="absolute inset-0 paper-texture opacity-20 pointer-events-none" />
             
             <div className="relative z-10 flex flex-col items-center gap-8">
               <div className="w-16 h-16 bg-[#F7F5F0] rounded-full flex items-center justify-center border border-[#D7CCC8]/50 group-hover:scale-110 transition-transform duration-500">
                 <Mail className="w-6 h-6 text-[#A1887F]" strokeWidth={1.5} />
               </div>
               
               <div className="space-y-2">
                 <p className="font-serif text-[#9E9E9E] text-sm tracking-widest uppercase">
                   投稿邮箱
                 </p>
                 <a 
                   href="mailto:xinghuo0308@outlook.com" 
                   className="font-serif text-2xl md:text-3xl text-[#3A3A3A] hover:text-[#A1887F] transition-colors border-b border-transparent hover:border-[#A1887F] pb-1 block"
                 >
                   xinghuo0308@outlook.com
                 </a>
               </div>
               
               <div className="mt-8 flex items-center gap-2 text-[#A1887F] text-sm font-serif italic opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
                 <span>期待你的来信</span>
                 <ArrowRight className="w-4 h-4" />
               </div>
             </div>
          </div>
          
          <div className="mt-16 space-y-4">
            <h3 className="font-youyou text-xl text-[#5D5D5D] tracking-widest">
              投稿指南
            </h3>
            <ul className="font-serif text-[#757575] space-y-2 text-sm md:text-base leading-relaxed">
              <li>• 邮件主题请统一格式：<strong>栏目名 + 作品名 + 作者名</strong></li>
              <li>• 建议以 Word 文档、PDF 或 Markdown 格式附件发送</li>
              <li>• 编辑部均为兼职运营，回复时间不定，但每封来信都会回复录用结果，请耐心等待</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
