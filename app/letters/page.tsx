import Navbar from "@/components/Navbar";
import { getCurrentIssue, getArticlesByCategory } from "@/lib/articles";

export const revalidate = 60;

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

export default async function Letters() {
  const currentIssue = await getCurrentIssue();
  const letters = await getArticlesByCategory("见字如面", 50, {
    issueId: currentIssue?.id ?? null,
  });

  if (letters.length === 0) {
    // 没有内容时显示征集中的占位
    const { default: Collecting } = await import("@/components/Collecting");
    return <Collecting />;
  }

  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <Navbar />

      <div className="pt-32 pb-24 px-4 md:px-8 max-w-4xl mx-auto animate-fade-in">
        {/* Page Title */}
        <div className="text-center mb-24 relative">
          <h1 className="font-youyou text-5xl md:text-6xl text-[#2C2C2C] tracking-[0.2em] relative z-10">
            见字如面
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#D7CCC8]/20 rounded-full blur-2xl -z-0 pointer-events-none" />
          <p className="font-serif text-[#757575] mt-6 tracking-widest text-sm italic">
            Letters &amp; Words
          </p>
        </div>

        {/* Letters List */}
        <div className="space-y-24">
          {letters.map((letter) => (
            <article key={letter.id} className="relative group">
              {/* Decorative line */}
              <div className="absolute -left-4 md:-left-12 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#D7CCC8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="font-youyou text-3xl md:text-4xl text-[#3A3A3A] tracking-widest group-hover:text-[#A1887F] transition-colors duration-500">
                    {letter.title}
                  </h2>

                  <div className="flex items-center justify-center gap-3">
                    <div className="h-[1px] w-8 bg-[#D7CCC8]" />
                    <span className="font-serif text-sm text-[#9E9E9E] tracking-widest">
                      {letter.author}
                    </span>
                    <div className="h-[1px] w-8 bg-[#D7CCC8]" />
                  </div>
                </div>

                {hasHtmlTags(letter.content) ? (
                  <div
                    className="font-serif text-[#5D5D5D] text-lg leading-loose prose prose-stone mx-auto
                      prose-p:mb-6 prose-headings:font-youyou prose-headings:text-[#2C2C2C]
                      prose-blockquote:border-l-[#D7CCC8] prose-blockquote:text-[#757575] prose-blockquote:italic"
                    dangerouslySetInnerHTML={{ __html: letter.content }}
                  />
                ) : (
                  <div className="font-serif text-[#5D5D5D] text-lg leading-loose">
                    {toParagraphs(letter.content || letter.excerpt).map((para, i) => (
                      <p key={i} className="whitespace-pre-wrap mb-6 last:mb-0 indent-8">
                        {para}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-32 text-center border-t border-[#D7CCC8]/30 pt-12">
          <p className="font-youyou text-[#A1887F] text-xl tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity cursor-default">
            字字皆是温柔
          </p>
        </div>
      </div>
    </main>
  );
}
