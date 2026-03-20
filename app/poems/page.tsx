import Navbar from "@/components/Navbar";
import { getCurrentIssue, getArticlesByCategory } from "@/lib/articles";

export const revalidate = 60;

function hasHtmlTags(input: string): boolean {
  return /<[^>]+>/.test(input);
}

function normalizePlainText(input: string): string {
  return input.replace(/\r\n/g, "\n");
}

export default async function Poems() {
  const currentIssue = await getCurrentIssue();
  const poems = await getArticlesByCategory("三行两句", 50, {
    issueId: currentIssue?.id ?? null,
  });

  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <Navbar />
      
      <div className="pt-32 pb-24 px-4 md:px-8 max-w-4xl mx-auto animate-fade-in">
        {/* Page Title */}
        <div className="text-center mb-24 relative">
          <h1 className="font-youyou text-5xl md:text-6xl text-[#2C2C2C] tracking-[0.2em] relative z-10">
            三行两句
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#D7CCC8]/20 rounded-full blur-2xl -z-0 pointer-events-none" />
          <p className="font-serif text-[#757575] mt-6 tracking-widest text-sm italic">
            Poetry &amp; Whispers
          </p>
        </div>

        {/* Poems List */}
        {poems.length === 0 ? (
          <div className="text-center font-serif text-[#9E9E9E] text-lg py-20">
            本期暂无内容，敬请期待。
          </div>
        ) : (
          <div className="space-y-32">
            {poems.map((poem) => (
              <article key={poem.id} className="relative group">
                {/* Decorative line */}
                <div className="absolute -left-4 md:-left-12 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#D7CCC8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="text-center space-y-8">
                  <h2 className="font-youyou text-3xl md:text-4xl text-[#3A3A3A] tracking-widest group-hover:text-[#A1887F] transition-colors duration-500">
                    {poem.title}
                  </h2>
                  
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-[1px] w-8 bg-[#D7CCC8]" />
                    <span className="font-serif text-sm text-[#9E9E9E] tracking-widest">
                      {poem.author}
                    </span>
                    <div className="h-[1px] w-8 bg-[#D7CCC8]" />
                  </div>

                  {hasHtmlTags(poem.content) ? (
                    <div
                      className="font-serif text-[#5D5D5D] text-lg leading-loose prose prose-stone mx-auto text-left"
                      dangerouslySetInnerHTML={{ __html: poem.content }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap break-words font-serif text-[#5D5D5D] text-lg leading-loose text-left mx-auto max-w-2xl">
                      {normalizePlainText(poem.content || poem.excerpt)}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-32 text-center border-t border-[#D7CCC8]/30 pt-12">
          <p className="font-youyou text-[#A1887F] text-xl tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity cursor-default">
            诗歌是灵魂的呼吸
          </p>
        </div>
      </div>
    </main>
  );
}
