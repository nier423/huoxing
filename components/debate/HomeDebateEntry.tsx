"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  formatDebateTopicDateLabel,
  getDebateTopicEndMs,
  type DebateTopicStatus,
} from "@/lib/debate-schedule";

interface HomeDebateEntryProps {
  href: string;
  issueLabel?: string | null;
  title: string;
  description?: string | null;
  startsAt: string | null;
  status: DebateTopicStatus;
}

const previewNotes = [
  { color: "#F8DDA9", rotate: "-7deg", top: "0.8rem", right: "4.6rem" },
  { color: "#F2C8D3", rotate: "8deg", top: "3.2rem", right: "1.1rem" },
  { color: "#CFE6B8", rotate: "-5deg", top: "5.8rem", right: "5.1rem" },
];

const STATUS_BADGE_LABELS: Record<DebateTopicStatus, string> = {
  not_started: "\u9884\u544a",
  ongoing: "\u8fdb\u884c\u4e2d",
  ended: "\u5df2\u7ed3\u675f",
};

const STATUS_HEADINGS: Record<DebateTopicStatus, string> = {
  not_started: "\u8bae\u9898\u9884\u544a",
  ongoing: "\u6b63\u5728\u8fdb\u884c",
  ended: "\u8bae\u9898\u56de\u987e",
};

export default function HomeDebateEntry({
  href,
  issueLabel,
  title,
  description,
  startsAt,
  status,
}: HomeDebateEntryProps) {
  const statusMeta = !startsAt
    ? "\u65f6\u95f4\u5f85\u5b9a"
    : status === "ongoing"
      ? `\u5f00\u653e\u81f3 ${formatDebateTopicDateLabel(getDebateTopicEndMs(startsAt))}`
      : status === "not_started"
        ? `${formatDebateTopicDateLabel(startsAt)} \u5f00\u542f`
        : `${formatDebateTopicDateLabel(getDebateTopicEndMs(startsAt))} \u5df2\u7ed3\u675f`;
  const statusBadgeClass =
    status === "ongoing"
      ? "bg-[#7F2F17] text-[#FFF3EB]"
      : status === "not_started"
        ? "bg-[#30577C] text-[#F2F8FF]"
        : "bg-[#6A655E] text-[#F8F5F1]";
  const ctaLabel =
    status === "ongoing" ? "\u8fdb\u5165\u8fa9\u8bba" : "\u67e5\u770b\u8bae\u9898";

  return (
    <Link href={href} className="block">
      <motion.article
        whileHover={{ y: -4, rotate: -0.6 }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="group relative overflow-hidden rounded-[1.8rem] border border-[#E9D3C1] bg-[linear-gradient(135deg,#FFF9F1_0%,#FFEAD6_47%,#F8D4C1_100%)] px-5 py-5 shadow-[0_20px_48px_-28px_rgba(105,54,21,0.5)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(201,87,44,0.18),transparent_36%)]" />

        <div className="relative z-10 min-h-[12.5rem] pr-[7.75rem] md:pr-0">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.68rem] tracking-[0.24em] shadow-[0_10px_18px_-14px_rgba(74,26,10,0.65)] ${statusBadgeClass}`}
          >
            <span className="h-2 w-2 rounded-full bg-[#FFD17D]" />
            {STATUS_BADGE_LABELS[status]}
          </div>

          <p className="mt-4 text-[0.7rem] uppercase tracking-[0.32em] text-[#A86B45]">
            {issueLabel ? `${issueLabel} / Debate Room` : "Debate Room"}
          </p>

          <h3 className="mt-2 max-w-[14rem] font-youyou text-[1.9rem] leading-[1.05] text-[#442317] md:text-[2.15rem]">
            {STATUS_HEADINGS[status]}
          </h3>

          <p className="mt-3 text-xs tracking-[0.18em] text-[#8D604B]">{statusMeta}</p>

          <p className="mt-3 max-w-[14rem] line-clamp-3 text-sm leading-6 text-[#6E4737]">
            {title}
          </p>

          {description ? (
            <p className="mt-2 max-w-[13rem] line-clamp-2 text-xs leading-5 text-[#936851]">
              {description}
            </p>
          ) : null}

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#C9855E] bg-white/80 px-4 py-2 text-sm text-[#6B351E] shadow-[0_10px_20px_-16px_rgba(107,53,30,0.55)] transition group-hover:border-[#A5522B] group-hover:text-[#8D3E19]">
            {ctaLabel}
            <span aria-hidden="true" className="text-base transition group-hover:translate-x-0.5">
              {"->"}
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-0 w-[8.4rem]">
          {previewNotes.map((note) => (
            <motion.div
              key={note.top + note.right}
              className="absolute h-[5.7rem] w-[4.8rem] rounded-[0.35rem] border border-black/5 shadow-[0_16px_24px_-18px_rgba(0,0,0,0.45)]"
              style={{
                backgroundColor: note.color,
                right: note.right,
                top: note.top,
                rotate: note.rotate,
              }}
              whileHover={{ rotate: "0deg" }}
            >
              <div className="mx-auto mt-2 h-[0.22rem] w-8 rounded-full bg-black/10" />
              <div className="mx-3 mt-2 space-y-1.5">
                <div className="h-1 rounded-full bg-black/10" />
                <div className="h-1 w-9 rounded-full bg-black/10" />
                <div className="h-1 w-7 rounded-full bg-black/10" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.article>
    </Link>
  );
}
