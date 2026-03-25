import Feed from "@/components/Feed";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import HomeDebateEntry from "@/components/debate/HomeDebateEntry";
import { getCurrentIssue, getLatestArticles } from "@/lib/articles";

export const revalidate = 60;

export default async function Home() {
  const currentIssue = await getCurrentIssue();
  const articles = await getLatestArticles(8, {
    issueId: currentIssue?.id ?? null,
  });

  return (
    <main className="relative min-h-screen bg-[#F7F5F0]">
      <Navbar />

      <div className="relative z-0 animate-fade-in">
        <div className="relative top-0 z-0 flex w-full flex-col justify-start overflow-visible md:sticky md:-z-10 md:h-[100svh] md:overflow-hidden">
          <Hero coverImage={currentIssue?.coverImage} />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col justify-between rounded-t-[2.5rem] bg-white pb-0 pt-12 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.15)] md:rounded-t-[3rem] md:pt-20">
          <Feed articles={articles} issue={currentIssue} />
          <HomeDebateEntry />

          <footer className="mt-24 border-t border-[#EFEBE9] bg-[#FAF9F6] py-12 text-center text-sm font-light tracking-widest text-[#9E9E9E]">
            <p>&copy; 2026 星火. 拒绝凝视，点亮旷野。</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
