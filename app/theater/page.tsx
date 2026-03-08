"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const stories = [
  {
    id: "shangqina",
    title: "商耆娜的故事",
    author: "则时",
    date: "2026.03.08",
    excerpt: "不知道是多久之前，我听人讲了一个故事。故事的主角叫商耆娜，他们叫她毗首羯磨之女、太阳神苏利耶的妻子...",
    category: "人间剧场",
  },
  {
    id: "commentary-shangqina",
    title: "论《商耆娜的故事》",
    author: "则时",
    date: "2026.03.08",
    excerpt: "提起印度神话中的女神，或许很多人脑海中第一时间浮现的是斩妖除魔的杜尔迦，代表财富、幸运和王权的拉克什米，或者司掌知识与智慧的萨拉斯瓦蒂...",
    category: "人间剧场",
  },
  {
    id: "jiangyunzhu",
    title: "江云竹",
    author: "佚名",
    date: "2026.03.08",
    excerpt: "江云竹是位官家小姐，父亲江烈是朝中御史，长兄江云川年方十八便已是进士，她自己也饱读诗书。只是母亲去世得早，与母亲娘家的亲戚也基本没有来往...",
    category: "人间剧场",
  },
  {
    id: "wojiaosongjing",
    title: "我叫宋婙，想结婚却发现我不是人",
    author: "珍珠",
    date: "2026.03.08",
    excerpt: "我叫宋婙，两千年生，现在二十六岁。但是最近我发现我可能不是人。我家里人很不能理解我，这个年龄为什么还没有把男人往家里带...",
    category: "人间剧场",
  },
];

export default function Theater() {
  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <Navbar />
      
      <div className="pt-32 pb-24 px-4 md:px-8 max-w-6xl mx-auto animate-fade-in">
        {/* Page Title */}
        <div className="text-center mb-24 relative">
          <h1 className="font-youyou text-5xl md:text-6xl text-[#2C2C2C] tracking-[0.2em] relative z-10">
            人间剧场
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#D7CCC8]/20 rounded-full blur-2xl -z-0 pointer-events-none" />
          <p className="font-serif text-[#757575] mt-6 tracking-widest text-sm italic">
            Stories of Life
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
                  <Link href={`/theater/${story.id}`}>{story.title}</Link>
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
                  href={`/theater/${story.id}`}
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
