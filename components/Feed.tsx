import Link from "next/link";
import type { SVGProps } from "react";
import { Mail, Newspaper } from "lucide-react";
import type { Issue } from "@/lib/articles";
import type { DebateTopicStatus } from "@/lib/debate-schedule";
import HomeDebateEntry from "@/components/debate/HomeDebateEntry";
import IssueBadge from "@/components/IssueBadge";
import { getIssueDisplayTitle } from "@/lib/issue-display";

interface FeedProps {
  issue?: Issue | null;
  debateEntries?: Array<{
    href: string;
    issueLabel?: string | null;
    title: string;
    description?: string | null;
    startsAt: string | null;
    status: DebateTopicStatus;
  }>;
}

function WeChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M8.35 5.18C4.84 5.18 2 7.57 2 10.53c0 1.8 1.06 3.44 2.83 4.45l-.72 2.56 2.82-1.48c.46.11.94.17 1.42.17-.08-.34-.12-.7-.12-1.07 0-3.46 3.2-6.23 7.12-6.23.23 0 .46.01.69.04-.61-2.2-2.97-3.79-5.69-3.79Zm-2.53 4a.84.84 0 1 1 0 1.68.84.84 0 0 1 0-1.68Zm5.07 0a.84.84 0 1 1 0 1.68.84.84 0 0 1 0-1.68Z" />
      <path d="M15.65 10.12c-3.52 0-6.35 2.33-6.35 5.2 0 1.58.87 3.02 2.35 3.99L11 21.54l2.42-1.28c.7.22 1.45.33 2.23.33 3.5 0 6.35-2.34 6.35-5.27 0-2.86-2.84-5.2-6.35-5.2Zm-2.16 4.13a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm4.35 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z" />
    </svg>
  );
}

export default function Feed({ issue = null, debateEntries = [] }: FeedProps) {
  return (
    <section className="bg-white/0 px-6 pb-4 pt-6 md:px-12 md:pb-8 md:pt-10 lg:px-24 lg:pb-10 lg:pt-12">
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-[#E3D8D0]/60 pb-10 md:pb-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-5 md:space-y-6">
              <div className="flex items-center gap-4 opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]">
                <span className="h-2 w-2 rounded-full bg-[#CFAF9D] shadow-[0_0_10px_rgba(207,175,157,0.5)]" />
                <p className="text-xs font-medium uppercase tracking-[0.4em] text-[#9C7D71]">
                  Current Issue
                </p>
                <IssueBadge label={issue?.label} />
              </div>

              <h2 className="font-youyou text-4xl font-bold leading-none text-[#26211E] opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards] md:text-5xl xl:text-[3.5rem]">
                {getIssueDisplayTitle(issue)}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4 pb-2 text-sm text-[#7C746D] opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards] md:justify-end">
              {issue ? (
                <Link
                  href={`/issues/${issue.slug}`}
                  className="inline-flex items-center rounded-full border border-[#D7CCC8] px-6 py-2.5 transition-all duration-300 hover:-translate-y-[2px] hover:border-[#A1887F] hover:bg-[#A1887F] hover:text-white hover:shadow-[0_8px_20px_rgba(161,136,127,0.3)]"
                >
                  {"\u67e5\u770b\u672c\u671f"}
                </Link>
              ) : null}

              <Link
                href="/issues"
                className="inline-flex items-center rounded-full border border-[#D7CCC8] px-6 py-2.5 transition-all duration-300 hover:-translate-y-[2px] hover:border-[#A1887F] hover:bg-[#A1887F] hover:text-white hover:shadow-[0_8px_20px_rgba(161,136,127,0.3)]"
              >
                {"\u5f80\u671f\u5f52\u6863"}
              </Link>
            </div>
          </div>
        </div>

        {debateEntries.length > 0 ? (
          <div className="pt-8 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.55s_forwards] md:pt-10">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#CFAF9D] shadow-[0_0_10px_rgba(207,175,157,0.45)]" />
              <p className="text-xs font-medium uppercase tracking-[0.36em] text-[#9C7D71]">
                Recent Events
              </p>
              <span className="text-xs tracking-[0.18em] text-[#B49B8C]">
                {"\u8fd1\u671f\u6d3b\u52a8"}
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {debateEntries.map((debateEntry) => (
                <div key={debateEntry.href} className="w-full">
                  <HomeDebateEntry
                    href={debateEntry.href}
                    issueLabel={debateEntry.issueLabel}
                    title={debateEntry.title}
                    description={debateEntry.description}
                    startsAt={debateEntry.startsAt}
                    status={debateEntry.status}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="border-t border-[#EEE4D8] pt-10 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.7s_forwards] md:pt-12">
          <section className="relative overflow-hidden rounded-[2.2rem] bg-[linear-gradient(180deg,#FFFDF9_0%,#F7F0E8_100%)] px-6 py-7 shadow-[0_24px_60px_-44px_rgba(56,39,24,0.5)] md:px-10 md:py-10">
            <div className="pointer-events-none absolute inset-0 rounded-[2.2rem] border border-[#2F221B]/65" />
            <div className="pointer-events-none absolute inset-[0.55rem] rounded-[1.9rem] border border-[#2F221B]/12" />
            <div className="pointer-events-none absolute left-6 right-6 top-5 h-px bg-[#2F221B]/10 md:left-10 md:right-10" />

            <div className="relative">
              <div className="max-w-[18rem]">
                <p className="font-liuye text-[2.8rem] leading-[0.86] tracking-[0.02em] text-[#241A14] md:text-[4.8rem]">
                  Let&apos;s
                  <br />
                  Connect
                </p>
                <p className="mt-4 max-w-sm text-sm leading-7 text-[#786456] md:text-[0.95rem]">
                  {"\u613f\u610f\u6765\u4fe1\u3001\u6765\u804a\u3001\u6765\u627e\u5230\u6211\u4eec\uff0c\u5c31\u4ece\u8fd9\u91cc\u5f00\u59cb\u3002"}
                </p>
              </div>

              <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-3">
                <div className="border-t border-[#D9CCBE] pt-3">
                  <div className="text-[#3A2C24]">
                    <Mail className="h-4 w-4" strokeWidth={1.7} />
                  </div>
                  <a
                    href="mailto:superray6261@gmail.com"
                    className="mt-4 block break-all text-[1.05rem] leading-7 text-[#3A2C24] transition hover:text-[#3A2C24]/80"
                  >
                    superray6261@gmail.com
                  </a>
                </div>

                <div className="border-t border-[#D9CCBE] pt-3">
                  <div className="text-[#3A2C24]">
                    <WeChatIcon className="h-4 w-4" />
                  </div>
                  <p className="mt-4 break-all text-[1.05rem] leading-7 text-[#3A2C24]">
                    xinghuotakan0308
                  </p>
                </div>

                <div className="border-t border-[#D9CCBE] pt-3">
                  <div className="text-[#3A2C24]">
                    <Newspaper className="h-4 w-4" strokeWidth={1.7} />
                  </div>
                  <p className="mt-4 text-[1.05rem] leading-7 text-[#3A2C24]">
                    {"\u661f\u706b-\u597d\u770b"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
