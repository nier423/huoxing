import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getArticlesByCategory } from "@/lib/articles";

export const dynamic = "force-dynamic";

function formatDate(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default async function Theater() {
  const stories = await getArticlesByCategory("人间剧场", 30);

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
          {stories.length === 0 ? (
            <p className="md:col-span-2 text-center text-[#9E9E9E] font-serif">
              这里还没有文章，请检查分类命名是否与数据库一致。
            </p>
          ) : stories.map((story) => (
            <article key={story.id} className="group flex flex-col gap-6 cursor-pointer">
              <div className="flex items-center justify-between text-xs font-medium tracking-[0.2em] text-[#9E9E9E] uppercase border-b border-[#D7CCC8]/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#A1887F] rounded-full opacity-60" />
                  <span className="text-[#A1887F]">{story.category}</span>
                </div>
                <span className="font-serif">{formatDate(story.publishedAt)}</span>
              </div>

              <div className="space-y-4">
                <h2 className="flex items-start justify-between gap-4 font-youyou text-3xl md:text-4xl text-[#2C2C2C] leading-snug group-hover:text-[#A1887F] transition-colors duration-500">
                  <Link href={`/articles/${story.slug}`}>{story.title}</Link>
                  <span className="shrink-0 text-sm md:text-base font-serif text-[#9E9E9E]">
                    阅读 {story.viewCount}
                  </span>
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
                  href={`/articles/${story.slug}`}
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
