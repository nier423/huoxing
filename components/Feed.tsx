import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { Article } from "@/lib/articles";

interface FeedProps {
  articles: Article[];
}

function formatDate(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default function Feed({ articles }: FeedProps) {
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

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group relative flex flex-col gap-6">
      <div className="flex items-center justify-between text-xs font-medium tracking-[0.2em] text-[#9E9E9E] uppercase border-b border-[#D7CCC8]/30 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#A1887F] rounded-full opacity-60" />
          <span className="text-[#A1887F]">{article.category}</span>
        </div>
        <span className="font-serif">{formatDate(article.publishedAt)}</span>
      </div>

      <div className="space-y-4">
        <h3 className="flex items-start justify-between gap-4 font-youyou text-3xl md:text-4xl text-[#2C2C2C] leading-snug group-hover:text-[#A1887F] transition-colors duration-500 cursor-pointer">
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
          <span className="shrink-0 inline-flex items-center gap-1.5 text-sm md:text-base font-serif text-[#9E9E9E]">
            <BookOpen className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
            <span>{article.viewCount}</span>
          </span>
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
