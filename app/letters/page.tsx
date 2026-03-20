import Navbar from "@/components/Navbar";
import { getCurrentIssue, getArticlesByCategory } from "@/lib/articles";

export const revalidate = 60;

const REPLY_MARKER = "以下是编辑部的真实回信";

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

/**
 * Split raw HTML or plain text at the reply marker.
 * Returns [letterPart, replyPart]. replyPart is null if no marker found.
 */
function splitAtReplyMarker(content: string): [string, string | null] {
  const idx = content.indexOf(REPLY_MARKER);
  if (idx === -1) return [content, null];
  return [content.slice(0, idx).trim(), content.slice(idx).trim()];
}

export default async function Letters() {
  const currentIssue = await getCurrentIssue();
  const letters = await getArticlesByCategory("见字如面", 50, {
    issueId: currentIssue?.id ?? null,
  });

  if (letters.length === 0) {
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
          {letters.map((letter) => {
            const isHtml = hasHtmlTags(letter.content);
            const [letterPart, replyPart] = splitAtReplyMarker(letter.content);

            return (
              <article key={letter.id} className="relative group">
                <div className="space-y-8">
                  {/* Title & Author */}
                  <div className="text-center space-y-4">
                    <h2 className="font-youyou text-3xl md:text-4xl text-[#3A3A3A] tracking-widest group-hover:text-[#A1887F] transition-colors duration-500 text-balance">
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

                  {/* Original Letter */}
                  {isHtml ? (
                    <div
                      className="font-serif text-[#5D5D5D] text-lg leading-loose prose prose-stone mx-auto
                        prose-p:mb-6 prose-headings:font-youyou prose-headings:text-[#2C2C2C]
                        prose-blockquote:border-l-[#D7CCC8] prose-blockquote:text-[#757575] prose-blockquote:italic"
                      dangerouslySetInnerHTML={{ __html: letterPart }}
                    />
                  ) : (
                    <div className="font-serif text-[#5D5D5D] text-lg leading-loose">
                      {toParagraphs(letterPart).map((para, i) => (
                        <p key={i} className="whitespace-pre-wrap mb-6 last:mb-0">
                          {para}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Editorial Reply — only rendered when the marker is present */}
                  {replyPart && (
                    <div className="mt-12 relative">
                      {/* Top divider with label */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#C8AFA4]/60" />
                        <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-[#A1887F] whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#A1887F] opacity-70 inline-block" />
                          编辑部回信
                          <span className="h-1.5 w-1.5 rounded-full bg-[#A1887F] opacity-70 inline-block" />
                        </span>
                        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#C8AFA4]/60" />
                      </div>

                      {/* Reply card */}
                      <div className="rounded-2xl bg-[#FAF6F2] border border-[#E8DDD8] px-8 py-8 shadow-[inset_0_1px_4px_rgba(0,0,0,0.03)]">
                        {isHtml ? (
                          <div
                            className="font-serif text-[#6B5F58] text-base md:text-lg leading-loose prose prose-stone mx-auto
                              prose-p:mb-5 prose-headings:font-youyou prose-headings:text-[#4A3F3A]
                              prose-blockquote:border-l-[#C8AFA4] prose-blockquote:text-[#8C7B74] prose-blockquote:italic"
                            dangerouslySetInnerHTML={{ __html: replyPart }}
                          />
                        ) : (
                          <div className="font-serif text-[#6B5F58] text-base md:text-lg leading-loose">
                            {toParagraphs(replyPart).map((para, i) => {
                              // Skip the marker line itself
                              if (para === REPLY_MARKER) return null;
                              return (
                                <p key={i} className="whitespace-pre-wrap mb-5 last:mb-0">
                                  {para}
                                </p>
                              );
                            })}
                          </div>
                        )}

                        {/* Bottom signature */}
                        <div className="mt-8 flex items-center gap-3">
                          <div className="h-[1px] flex-1 bg-[#DDD0CA]/60" />
                          <span className="font-youyou text-sm text-[#A1887F] tracking-widest opacity-70">
                            星火编辑部
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Article separator */}
                <div className="mt-24 h-[1px] bg-gradient-to-r from-transparent via-[#D7CCC8]/40 to-transparent" />
              </article>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center pt-12">
          <p className="font-youyou text-[#A1887F] text-xl tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity cursor-default">
            字字皆是温柔
          </p>
        </div>
      </div>
    </main>
  );
}
