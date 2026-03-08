"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const stories = [
  {
    id: "wojiaojiangshan",
    title: "我叫江山娇，出生于2020年",
    author: "珍珠",
    date: "2026.03.08",
    excerpt: "我叫江山娇，我出生的那年，被称作互联网女性主义元年。很神奇，对不对？我很高兴自己能够和这个具有特别意义的年份绑定...",
    category: "胡说八道",
  },
  {
    id: "ainvhenzuozuo",
    title: "“爱女”很做作？那是因为你当惯了“默认值”",
    author: "老娘月经准时",
    date: "2026.03.08",
    excerpt: "这世界上有两件事很奇怪：一是女人要专门发明个词叫“爱女”，才能理直气壮地活着；二是男人从来不需要“爱男”，却活得像个人生赢家...",
    category: "胡说八道",
  },
  {
    id: "jiduanvquancungbuzhuncunzai",
    title: "论极端女权从不存在的事实",
    author: "林知微",
    date: "2026.03.08",
    excerpt: "认为东亚女权的本质是话语权切实缺失后带来的代偿反应。韩国、中国，除了日本之外的东亚国家，恰恰因为妻权和女权的保护缺失...",
    category: "胡说八道",
  },
];

export default function Nonsense() {
  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <Navbar />
      
      <div className="pt-32 pb-24 px-4 md:px-8 max-w-6xl mx-auto animate-fade-in">
        {/* Page Title */}
        <div className="text-center mb-24 relative">
          <h1 className="font-youyou text-5xl md:text-6xl text-[#2C2C2C] tracking-[0.2em] relative z-10">
            胡说八道
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#D7CCC8]/20 rounded-full blur-2xl -z-0 pointer-events-none" />
          <p className="font-serif text-[#757575] mt-6 tracking-widest text-sm italic">
            Whimsical Thoughts
          </p>
        </div>

        {/* Stories List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24">
          {stories.map((story) => (
            <article key={story.id} className="group flex flex-col gap-6 cursor-pointer">
              <div className="flex items-center justify-between text-xs font-medium tracking-[0.2em] text-[#9E9E9E] uppercase border-b border-[#D7CCC8]/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#A1887F] rounded-full opacity-60" />
                  <span className="text-[#A1887F]">{story.category}</span>
                </div>
                <span className="font-serif">{story.date}</span>
              </div>

              <div className="space-y-4">
                <h2 className="font-youyou text-3xl md:text-4xl text-[#2C2C2C] leading-snug group-hover:text-[#A1887F] transition-colors duration-500">
                  <Link href={`/nonsense/${story.id}`}>{story.title}</Link>
                </h2>

                <p className="font-serif text-[#5D5D5D] leading-loose text-base line-clamp-3 opacity-90 group-hover:opacity-100 transition-opacity">
                  {story.excerpt}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-sm text-[#9E9E9E] font-serif italic">
                  作者：{story.author}
                </span>

                <Link 
                  href={`/nonsense/${story.id}`}
                  className="flex items-center gap-2 text-[#A1887F] text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-x-2 group-hover:translate-x-0"
                >
                  <span>阅读全文</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
