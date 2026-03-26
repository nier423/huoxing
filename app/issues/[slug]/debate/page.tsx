import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Scale } from "lucide-react";
import DebateWall from "@/components/debate/DebateWall";
import IssueBadge from "@/components/IssueBadge";
import Navbar from "@/components/Navbar";
import { getIssueBySlug } from "@/lib/articles";
import { getDebateTopicsByIssueId } from "@/lib/debates";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function IssueDebatePage({ params }: PageProps) {
  const slug = decodeURIComponent(params.slug);
  const issue = await getIssueBySlug(slug);

  if (!issue) {
    notFound();
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const topics = await getDebateTopicsByIssueId(issue.id, user?.id ?? null);

  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 md:px-8 md:pt-32">
        <Link
          href={`/issues/${issue.slug}`}
          className="group mb-10 inline-flex items-center text-[#9E9E9E] transition-colors hover:text-[#A1887F]"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-serif tracking-widest">返回本期</span>
        </Link>

        <header className="rounded-[2rem] border border-[#E8E4DF] bg-white/80 px-6 py-8 md:px-8 md:py-10">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#9E9E9E]">
            <Scale className="h-4 w-4 text-[#A1887F]" />
            <span>Debate Room</span>
            <IssueBadge label={issue.label} />
          </div>

          <h1 className="mt-5 font-youyou text-4xl text-[#2C2C2C] md:text-5xl">
            本期辩论
          </h1>

          <p className="mt-4 max-w-3xl font-serif text-base leading-loose text-[#6C665F] md:text-lg">
            游戏规则：可以粘贴/删除自己的纸条。可以点赞她人纸条，不能点赞自己纸条。需要注册登录后吵架。
          </p>
        </header>

        <div className="mt-10">
          <DebateWall
            currentUserId={user?.id ?? null}
            initialTopics={topics}
            isLoggedIn={Boolean(user)}
            issueSlug={issue.slug}
          />
        </div>
      </div>
    </main>
  );
}
