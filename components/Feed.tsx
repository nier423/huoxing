"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

const articles = [
  {
    id: 1,
    category: "人间剧场",
    title: "商耆娜的故事",
    excerpt: "这是一个关于寻找、迷失与回归的故事。商耆娜站在时间的十字路口，回望过去，那些记忆如同散落的珍珠，串联起她波澜壮阔的一生...",
    author: "则时",
    date: "2026.03.08",
    sparked: false,
    link: "/theater/shangqina"
  },
  {
    id: 2,
    category: "有话漫谈",
    title: "冰层下的浮鱼",
    excerpt: "从小奶奶就和我说，你父亲爱你。那时是我又一次和父亲吵架完，躲在奶奶家避风头。她是个普通的东北农村老太太，年轻时候经历些风雨，年老时也很要强...",
    author: "Cee养花养鸟中",
    date: "2026.03.08",
    sparked: true,
    link: "/slow-talk/bingchengxiadefuyu"
  },
  {
    id: 3,
    category: "胡说八道",
    title: "我叫江山娇，出生于2020年",
    excerpt: "我叫江山娇，我出生的那年，被称作互联网女性主义元年。很神奇，对不对？我很高兴自己能够和这个具有特别意义的年份绑定...",
    author: "珍珠",
    date: "2026.03.08",
    sparked: false,
    link: "/nonsense/wojiaojiangshan"
  },
  {
    id: 4,
    category: "三行两句",
    title: "星火燎原",
    excerpt: "勤劳的殷实,不同的边界\n不脱离边际,像欣赏一首诗\n细细品其中的卓绝,和满足期望的心感。",
    author: "肖艳琳",
    date: "2026.03.08",
    sparked: false,
    link: "/poems"
  },
];

export default function Feed() {
  return (
    <section className="py-24 px-4 md:px-8 bg-[#F7F5F0]">
      <div className="max-w-6xl mx-auto space-y-24">
        <h2 className="font-youyou text-4xl md:text-5xl text-center mb-16 text-[#3A3A3A] tracking-[0.2em] relative inline-block left-1/2 -translate-x-1/2 after:content-[''] after:absolute after:-bottom-4 after:left-1/2 after:-translate-x-1/2 after:w-12 after:h-[1px] after:bg-[#A1887F]">
          最新故事
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ArticleCard({ article }: { article: any }) {
  return (
    <article className="group relative flex flex-col gap-6">
      <div className="flex items-center justify-between text-xs font-medium tracking-[0.2em] text-[#9E9E9E] uppercase border-b border-[#D7CCC8]/30 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#A1887F] rounded-full opacity-60" />
          <span className="text-[#A1887F]">{article.category}</span>
        </div>
        <span className="font-serif">{article.date}</span>
      </div>

      <div className="space-y-4">
        <h3 className="font-youyou text-3xl md:text-4xl text-[#2C2C2C] leading-snug group-hover:text-[#A1887F] transition-colors duration-500 cursor-pointer">
          <Link href={article.link || `/article/${article.id}`}>{article.title}</Link>
        </h3>

        <p className="font-serif text-[#5D5D5D] leading-loose text-base md:text-lg line-clamp-3 opacity-90 group-hover:opacity-100 transition-opacity">
          {article.excerpt}
        </p>
      </div>

      <div className="pt-2 flex items-center justify-between">
        <span className="text-sm text-[#9E9E9E] font-serif italic border-b border-transparent hover:border-[#D7CCC8] transition-colors cursor-pointer">
          作者：{article.author}
        </span>
      </div>
    </article>
  );
}
