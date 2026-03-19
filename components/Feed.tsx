import Link from "next/link";
import type { Article, Issue } from "@/lib/articles";
import { getIssueDisplayTitle } from "@/lib/issue-display";
import ArticleCard from "@/components/ArticleCard";
import IssueBadge from "@/components/IssueBadge";

interface FeedProps {
  articles: Article[];
  issue?: Issue | null;
}

export default function Feed({ articles, issue = null }: FeedProps) {
  return (
    <section className="bg-white/0 px-6 py-12 md:py-20 lg:py-28 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl space-y-16">
        
        {/* Header Section */}
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between border-b border-[#E3D8D0]/60 pb-12 mb-16 lg:mb-24">
          <div className="space-y-6">
            <div className="flex items-center gap-4 opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]">
              <span className="h-2 w-2 rounded-full bg-[#CFAF9D] shadow-[0_0_10px_rgba(207,175,157,0.5)]" />
              <p className="text-xs uppercase tracking-[0.4em] text-[#9C7D71] font-medium">
                Current Issue
              </p>
              <IssueBadge label={issue?.label} />
            </div>

            <h2 className="font-youyou text-4xl text-[#26211E] md:text-5xl xl:text-[3.5rem] leading-none opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards] font-bold">
              {getIssueDisplayTitle(issue)}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-sm text-[#7C746D] opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards] pb-2">
            {issue && (
              <Link
                href={`/issues/${issue.slug}`}
                className="inline-flex items-center rounded-full border border-[#D7CCC8] px-6 py-2.5 transition-all duration-300 hover:bg-[#A1887F] hover:text-white hover:border-[#A1887F] hover:shadow-[0_8px_20px_rgba(161,136,127,0.3)] hover:-translate-y-[2px]"
              >
                查看本期
              </Link>
            )}

            <Link
              href="/issues"
              className="inline-flex items-center rounded-full border border-[#D7CCC8] px-6 py-2.5 transition-all duration-300 hover:bg-[#A1887F] hover:text-white hover:border-[#A1887F] hover:shadow-[0_8px_20px_rgba(161,136,127,0.3)] hover:-translate-y-[2px]"
            >
              往期归档
            </Link>
          </div>
        </div>

        {/* Content Section */}
        {articles.length === 0 ? (
          <div className="rounded-[2rem] border border-[#E8E4DF] bg-[#FDFCF9] px-8 py-20 text-center text-[#8D8D8D] font-serif text-lg opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
            当前刊还没有已发布文章，敬请期待。
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-16 lg:gap-x-24 gap-y-16 md:gap-y-24 md:grid-cols-2 relative">
            {/* Elegant vertical divider for desktop */}
            <div className="absolute left-1/2 top-8 bottom-8 w-[1px] bg-gradient-to-b from-transparent via-[#E3D8D0]/60 to-transparent hidden md:block -translate-x-1/2 pointer-events-none" />
            
            {articles.map((article, index) => (
              <div 
                key={article.id} 
                className="opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]"
                style={{ animationDelay: `${index * 150 + 600}ms` }}
              >
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
