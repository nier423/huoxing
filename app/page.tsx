import Feed from "@/components/Feed";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { getCurrentIssue } from "@/lib/articles";
import { getDebateTopicSummariesByIssueId } from "@/lib/debates";
import { getPreferredPublicImagePath } from "@/lib/public-assets";

export const revalidate = 60;

export default async function Home() {
  const currentIssue = await getCurrentIssue();
  const debateTopics = currentIssue
    ? await getDebateTopicSummariesByIssueId(currentIssue.id)
    : [];
  const featuredTopic = debateTopics[0] ?? null;
  const heroCoverImage = getPreferredPublicImagePath(currentIssue?.coverImage) ?? "/poster.webp";

  return (
    <main className="relative min-h-screen bg-[#F7F5F0]">
      <Navbar />

        <div className="relative z-0 animate-fade-in">
          <div className="relative top-0 flex w-full flex-col justify-start overflow-visible md:sticky md:h-[100svh] md:-z-10 md:overflow-hidden">
            <Hero coverImage={heroCoverImage} />
          </div>

        <div className="relative z-10 flex min-h-screen flex-col rounded-t-[2.5rem] bg-white pb-0 pt-4 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.15)] md:rounded-t-[3rem] md:pt-8">
          <Feed
            issue={currentIssue}
            debateEntry={
              currentIssue && featuredTopic
                ? {
                    href: `/issues/${currentIssue.slug}/debate`,
                    issueLabel: currentIssue.label,
                    title: featuredTopic.title,
                    description: featuredTopic.description,
                  }
                : null
            }
          />

          <footer className="mt-2 border-t border-[#EFEBE9] bg-transparent py-6 text-center text-sm font-light tracking-widest text-[#9E9E9E] md:py-7">
            <p>&copy; 2026 星火. 拒绝凝视，点亮旷野。</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
