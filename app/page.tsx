import Feed from "@/components/Feed";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { getCurrentIssue, getLatestArticles } from "@/lib/articles";

export const revalidate = 60;

export default async function Home() {
  const currentIssue = await getCurrentIssue();
  const articles = await getLatestArticles(8, {
    issueId: currentIssue?.id ?? null,
  });

  return (
    <main className="min-h-screen bg-[#F7F5F0] relative">
      <Navbar />

      <div className="animate-fade-in relative z-0">
        {/* Sticky Hero Background */}
        <div className="sticky top-0 h-[100svh] w-full flex flex-col justify-start -z-10 overflow-hidden">
          <Hero coverImage={currentIssue?.coverImage} />
        </div>

        {/* Content scrolling over the Hero */}
        <div className="relative z-10 bg-white rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.15)] pt-12 md:pt-20 pb-0 min-h-screen flex flex-col justify-between">
          <Feed articles={articles} issue={currentIssue} />
          
          <footer className="border-t border-[#EFEBE9] bg-[#FAF9F6] py-12 text-center text-sm font-light tracking-widest text-[#9E9E9E] mt-24">
            <p>&copy; 2026 星火. 拒绝凝视，点亮旷野。</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
