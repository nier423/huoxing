"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  formatDebateTopicDateTimeLabel,
  type DebateTopicStatus,
} from "@/lib/debate-schedule";

interface HomeDebateEntryProps {
  href: string;
  issueLabel?: string | null;
  title: string;
  description?: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: DebateTopicStatus;
  isActive?: boolean;
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
  endsAt,
  status,
  isActive = false,
}: HomeDebateEntryProps) {
  const statusMeta = !startsAt || !endsAt
    ? "\u65f6\u95f4\u5f85\u5b9a"
    : status === "ongoing"
      ? `\u5f00\u653e\u81f3 ${formatDebateTopicDateTimeLabel(endsAt)}`
      : status === "not_started"
        ? `${formatDebateTopicDateTimeLabel(startsAt)} \u5f00\u542f`
        : `${formatDebateTopicDateTimeLabel(endsAt)} \u5df2\u7ed3\u675f`;
  const statusBadgeClass =
    status === "ongoing"
      ? "bg-[#7F2F17] text-[#FFF3EB]"
      : status === "not_started"
        ? "bg-[#30577C] text-[#F2F8FF]"
        : "bg-[#6A655E] text-[#F8F5F1]";
  const ctaLabel =
    status === "ongoing" ? "\u8fdb\u5165\u8fa9\u8bba" : "\u67e5\u770b\u8bae\u9898";
  const articleClassName = isActive
    ? "border-[#D8A784] bg-[linear-gradient(135deg,#FFF8EE_0%,#FFE7D0_42%,#F4C2AB_100%)] shadow-[0_34px_72px_-28px_rgba(105,54,21,0.58)]"
    : "border-[#E9D3C1] bg-[linear-gradient(135deg,#FFF9F1_0%,#FFEAD6_47%,#F8D4C1_100%)] shadow-[0_20px_48px_-28px_rgba(105,54,21,0.5)]";
  const bodyClassName = isActive
    ? "min-h-[14rem] pr-[8.75rem] md:min-h-[15rem] xl:pr-[9rem]"
    : "min-h-[12.5rem] pr-[7.75rem] xl:pr-[8.25rem]";
  const headingClassName = isActive
    ? "text-[2.2rem] md:text-[2.5rem]"
    : "text-[1.9rem] md:text-[2.15rem]";
  const titleClassName = isActive
    ? "max-w-[18rem] line-clamp-4 text-[0.98rem] leading-7"
    : "max-w-[14rem] line-clamp-3 text-sm leading-6";
  const descriptionClassName = isActive
    ? "max-w-[17rem] line-clamp-3 text-[0.82rem] leading-6 text-[#855D4A]"
    : "max-w-[13rem] line-clamp-2 text-xs leading-5 text-[#936851]";
  const noteWrapClassName = isActive ? "w-[9.8rem] xl:w-[10.6rem]" : "w-[8.4rem]";

  return (
    <Link href={href} className="block">
      <motion.article
        whileHover={{ y: -4, rotate: -0.6 }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className={`group relative overflow-hidden rounded-[1.8rem] border px-5 py-5 transition-[box-shadow,border-color,background,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${articleClassName}`}
      >
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-90"} bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(201,87,44,0.24),transparent_38%)]`}
        />
        <div
          className={`absolute inset-x-5 top-4 h-px bg-[#D59B74]/35 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`}
        />

        <div className={`relative z-10 ${bodyClassName}`}>
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.68rem] tracking-[0.24em] shadow-[0_10px_18px_-14px_rgba(74,26,10,0.65)] ${statusBadgeClass}`}
          >
            <span className="h-2 w-2 rounded-full bg-[#FFD17D]" />
            {STATUS_BADGE_LABELS[status]}
          </div>

          <p className="mt-4 text-[0.7rem] uppercase tracking-[0.32em] text-[#A86B45]">
            {issueLabel ? `${issueLabel} / Debate Room` : "Debate Room"}
          </p>

          <h3
            className={`mt-2 max-w-[16rem] font-youyou leading-[1.03] text-[#442317] transition-[font-size,max-width] duration-500 ${headingClassName}`}
          >
            {STATUS_HEADINGS[status]}
          </h3>

          <p className="mt-3 text-xs tracking-[0.18em] text-[#8D604B]">{statusMeta}</p>

          <p
            className={`mt-3 text-[#6E4737] transition-[font-size,line-height,max-width] duration-500 ${titleClassName}`}
          >
            {title}
          </p>

          {description ? (
            <p className={`mt-2 transition-[font-size,line-height,max-width] duration-500 ${descriptionClassName}`}>
              {description}
            </p>
          ) : null}

          <div
            className={`mt-5 inline-flex items-center gap-2 rounded-full border bg-white/80 px-4 py-2 text-sm text-[#6B351E] shadow-[0_10px_20px_-16px_rgba(107,53,30,0.55)] transition-all duration-300 ${
              isActive
                ? "border-[#A5522B] text-[#8D3E19] shadow-[0_14px_26px_-16px_rgba(107,53,30,0.5)]"
                : "border-[#C9855E] group-hover:border-[#A5522B] group-hover:text-[#8D3E19]"
            }`}
          >
            {ctaLabel}
            <span
              aria-hidden="true"
              className="text-base transition group-hover:translate-x-0.5"
            >
              {"->"}
            </span>
          </div>
        </div>

        <div
          className={`pointer-events-none absolute inset-y-0 right-0 transition-[width,transform,opacity] duration-500 ${noteWrapClassName} ${isActive ? "translate-x-0 opacity-100" : "translate-x-1 opacity-90"}`}
        >
          {previewNotes.map((note) => (
            <motion.div
              key={note.top + note.right}
              className={`absolute rounded-[0.35rem] border border-black/5 shadow-[0_16px_24px_-18px_rgba(0,0,0,0.45)] transition-[height,width,filter] duration-500 ${isActive ? "h-[6.3rem] w-[5.2rem]" : "h-[5.7rem] w-[4.8rem]"}`}
              style={{
                backgroundColor: note.color,
                right: note.right,
                top: note.top,
                rotate: note.rotate,
              }}
              whileHover={{ rotate: "0deg", y: -2 }}
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
