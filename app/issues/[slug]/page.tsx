import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import IssueBadge from "@/components/IssueBadge";
import Navbar from "@/components/Navbar";
import {
  getArticlesByIssue,
  getIssueBySlug,
  getIssuePageCategoryHeading,
  groupArticlesByCategory,
} from "@/lib/articles";
import { hasIssueDrawing } from "@/lib/issue-drawings";
import { getIssueDisplayTitle } from "@/lib/issue-display";

export const revalidate = 60;

function formatDate(input: string | null) {
  if (!input) {
    return "待发布";
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function IssueDetailPage({ params }: PageProps) {
  const slug = decodeURIComponent(params.slug);
  const issue = await getIssueBySlug(slug);

  if (!issue) {
    notFound();
  }

  const [articles, showDrawing] = await Promise.all([
    getArticlesByIssue(issue.id),
    hasIssueDrawing(issue.id),
  ]);
  const groups = groupArticlesByCategory(articles);

  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 md:px-8">
        <header className="mb-16 border-b border-[#DDD6CE] pb-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A1887F] opacity-60" />
            <p className="text-xs uppercase tracking-[0.35em] text-[#9E9E9E]">Issue</p>
            <IssueBadge label={issue.label} />
            {issue.isCurrent ? (
              <span className="inline-flex items-center rounded-full border border-[#E7D7CD] px-3 py-1 text-xs text-[#A1887F]">
                当前刊
              </span>
            ) : null}
          </div>

          <div className="mt-5 grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div className="space-y-4">
              <h1 className="font-youyou text-5xl text-[#2C2C2C] md:text-6xl">
                {getIssueDisplayTitle(issue)}
              </h1>
            </div>

            <div className="space-y-3 text-sm text-[#7C746D] md:text-right">
              <p>发布时间：{formatDate(issue.publishedAt)}</p>
              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <Link
                  href={`/issues/${issue.slug}/debate`}
                  className="inline-flex items-center rounded-full border border-[#D7CCC8] px-5 py-2 transition-colors hover:border-[#A1887F] hover:text-[#A1887F]"
                >
                  进入辩论
                </Link>
                {showDrawing ? (
                  <Link
                    href={`/issues/${issue.slug}/drawing`}
                    className="inline-flex items-center rounded-full border border-[#D7CCC8] px-5 py-2 transition-colors hover:border-[#A1887F] hover:text-[#A1887F]"
                  >
                    画里话外
                  </Link>
                ) : null}
                <Link
                  href="/issues"
                  className="inline-flex items-center rounded-full border border-[#D7CCC8] px-5 py-2 transition-colors hover:border-[#A1887F] hover:text-[#A1887F]"
                >
                  返回归档
                </Link>
              </div>
            </div>
          </div>
        </header>

        {groups.length === 0 ? (
          <div className="rounded-[2rem] border border-[#E8E4DF] bg-white/70 px-8 py-14 text-center text-[#8D8D8D]">
            这一期还没有已发布文章。
          </div>
        ) : (
          <div className="space-y-16">
            {groups.map(([category, categoryArticles]) => (
              <section key={category} id={category} className="scroll-mt-28 space-y-8">
                <div className="flex items-center gap-3 border-b border-[#DDD6CE] pb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#A1887F] opacity-60" />
                  <h2 className="font-youyou text-3xl text-[#2C2C2C]">
                    {getIssuePageCategoryHeading(category)}
                  </h2>
                  <span className="text-sm text-[#8D8D8D]">{categoryArticles.length} 篇</span>
                </div>

                <div className="grid grid-cols-1 gap-x-12 gap-y-20 md:grid-cols-2">
                  {categoryArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      showReadMore
                      extendedCategoryLabel
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
