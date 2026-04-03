import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DrawingCommentSection from "@/components/drawing/DrawingCommentSection";
import DrawingImageSwiper from "@/components/drawing/DrawingImageSwiper";
import Navbar from "@/components/Navbar";
import { fetchDrawingComments } from "@/app/actions/drawing-comments";
import { getIssueBySlug } from "@/lib/articles";
import { DRAWING_GALLERY_IMAGE_URLS } from "@/lib/drawing-gallery";
import { getIssueNumberFromLabel } from "@/lib/issue-display";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function IssueDrawingPage({ params }: PageProps) {
  const slug = decodeURIComponent(params.slug);
  const issue = await getIssueBySlug(slug);

  if (!issue) {
    notFound();
  }

  if (getIssueNumberFromLabel(issue.label) !== 3) {
    notFound();
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialComments = await fetchDrawingComments(issue.id);

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

        <div className="mb-8 space-y-8">
          <header className="space-y-2">
            <h1 className="font-youyou text-2xl leading-snug text-[#2C2C2C] md:text-3xl lg:text-[2rem]">
              月经六周年：只想感谢布洛芬和花掉的六千块
            </h1>   
          </header>
          <DrawingImageSwiper images={DRAWING_GALLERY_IMAGE_URLS} />
          <p className="text-sm text-[#9E9E9E] md:text-[0.95rem]">
              小红书ID：我是鹿人甲
            </p>
        </div>

        <DrawingCommentSection
          issueId={issue.id}
          issueSlug={issue.slug}
          isLoggedIn={Boolean(user)}
          initialComments={initialComments}
        />
      </div>
    </main>
  );
}
