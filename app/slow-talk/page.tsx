"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const stories = [
  {
    id: "bingchengxiadefuyu",
    title: "冰层下的浮鱼",
    author: "Cee养花养鸟中",
    date: "2026.03.08",
    excerpt: "从小奶奶就和我说，你父亲爱你。那时是我又一次和父亲吵架完，躲在奶奶家避风头。她是个普通的东北农村老太太，年轻时候经历些风雨，年老时也很要强...",
    category: "有话漫谈",
  },
  {
    id: "weishuochukoudexin",
    title: "未说出口的信",
    author: "希希大王",
    date: "2026.03.08",
    excerpt: "我总在傍晚停在巷口那棵梧桐树下，看风卷着半黄的叶子擦过灰墙。风里裹着隔壁糖炒栗子的香，混着老墙根青苔的潮意，还有远处放学孩子跑过时带起的碎笑声...",
    category: "有话漫谈",
  },
  {
    id: "muaishenhua",
    title: "母爱神话",
    author: "MOF-808",
    date: "2026.03.08",
    excerpt: "我有三个侄儿。我喜欢听祂们的呼喊，平日里软糯糯的音调慢吞吞地从喉咙伸了个懒腰才出来，急起来声母和韵母又前脚踩着后脚抢着往外跑...",
    category: "有话漫谈",
  },
];

export default function SlowTalk() {
  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <Navbar />
      
      <div className="pt-32 pb-24 px-4 md:px-8 max-w-6xl mx-auto animate-fade-in">
        {/* Page Title */}
        <div className="text-center mb-24 relative">
          <h1 className="font-youyou text-5xl md:text-6xl text-[#2C2C2C] tracking-[0.2em] relative z-10">
            有话漫谈
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#D7CCC8]/20 rounded-full blur-2xl -z-0 pointer-events-none" />
          <p className="font-serif text-[#757575] mt-6 tracking-widest text-sm italic">
            Slow Talks & Thoughts
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
                  <Link href={`/slow-talk/${story.id}`}>{story.title}</Link>
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
                  href={`/slow-talk/${story.id}`}
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
