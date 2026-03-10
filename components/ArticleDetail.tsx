import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import EchoSection from "@/components/EchoSection";
import ViewTracker from "@/components/ViewTracker";
import { getArticleBySlug } from "@/lib/articles";
import { fetchEchoes } from "@/app/actions/echoes";
import { createClient } from "@/lib/supabase/server";

interface ArticleDetailProps {
  slug: string;
  backHref: string;
  fallbackCategory?: string;
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

function hasHtmlTags(input: string): boolean {
  return /<[^>]+>/.test(input);
}

function toParagraphs(input: string): string[] {
  return input
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function ArticleDetail({
  slug,
  backHref,
  fallbackCategory = "未分类",
}: ArticleDetailProps) {
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const echoes = await fetchEchoes(article.id);
  const category = article.category || fallbackCategory;
  const plainTextParagraphs = toParagraphs(article.content);
  const shouldUseHtml = hasHtmlTags(article.content);

  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <Navbar />
      <ViewTracker articleId={article.id} />

      <article className="pt-32 pb-24 px-4 md:px-8 max-w-3xl mx-auto animate-fade-in">
        <Link
          href={backHref}
          className="inline-flex items-center text-[#9E9E9E] hover:text-[#A1887F] transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-serif tracking-widest">返回列表</span>
        </Link>

        <header className="text-center mb-16 space-y-6">
          <div className="flex items-center justify-center gap-3 text-xs text-[#A1887F] font-medium tracking-[0.2em] uppercase">
            <span className="w-1.5 h-1.5 bg-[#A1887F] rounded-full opacity-60" />
            <span>{category}</span>
          </div>

          <h1 className="font-youyou text-4xl md:text-5xl lg:text-6xl text-[#2C2C2C] leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center justify-center gap-4 text-sm text-[#9E9E9E] font-serif italic pt-4">
            <span>作者：{article.author}</span>
            <span className="w-1 h-1 bg-[#D7CCC8] rounded-full" />
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </header>

        {shouldUseHtml ? (
          <div
            className="prose prose-stone prose-lg mx-auto font-serif text-[#3A3A3A] leading-loose
              prose-p:mb-8 prose-p:indent-8 prose-headings:font-youyou prose-headings:text-[#2C2C2C]
              prose-a:text-[#A1887F] prose-a:no-underline hover:prose-a:text-[#8D6E63]
              prose-blockquote:border-l-[#D7CCC8] prose-blockquote:text-[#757575] prose-blockquote:italic
              prose-strong:text-[#5D5D5D] prose-strong:font-normal"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <div className="mx-auto font-serif text-[#3A3A3A] leading-loose text-lg">
            {plainTextParagraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 12)}`} className="mb-8 indent-8 whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>
        )}

        <EchoSection articleId={article.id} isLoggedIn={Boolean(user)} initialEchoes={echoes} />

        <div className="mt-16 pt-10 border-t border-[#D7CCC8]/30 text-center">
          <div className="w-8 h-8 mx-auto bg-[#EFEBE9] rounded-full flex items-center justify-center mb-6">
            <span className="w-1.5 h-1.5 bg-[#A1887F] rounded-full" />
          </div>
          <p className="font-youyou text-[#A1887F] text-lg tracking-widest opacity-80">
            星火 · {category}
          </p>
        </div>
      </article>
    </main>
  );
}
