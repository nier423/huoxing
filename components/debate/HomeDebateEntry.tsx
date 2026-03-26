"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface HomeDebateEntryProps {
  href: string;
  issueLabel?: string | null;
  title: string;
  description?: string | null;
}

const previewNotes = [
  { color: "#F8DDA9", rotate: "-7deg", top: "0.8rem", right: "4.6rem" },
  { color: "#F2C8D3", rotate: "8deg", top: "3.2rem", right: "1.1rem" },
  { color: "#CFE6B8", rotate: "-5deg", top: "5.8rem", right: "5.1rem" },
];

export default function HomeDebateEntry({
  href,
  issueLabel,
  title,
  description,
}: HomeDebateEntryProps) {
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
          <div className="inline-flex items-center gap-2 rounded-full bg-[#7F2F17] px-3 py-1 text-[0.68rem] tracking-[0.24em] text-[#FFF3EB] shadow-[0_10px_18px_-14px_rgba(74,26,10,0.65)]">
            <span className="h-2 w-2 rounded-full bg-[#FFD17D]" />
            本期辩论招募中
          </div>

          <p className="mt-4 text-[0.7rem] uppercase tracking-[0.32em] text-[#A86B45]">
            {issueLabel ? `${issueLabel} · Debate Room` : "Debate Room"}
          </p>

          <h3 className="mt-2 max-w-[14rem] font-youyou text-[1.9rem] leading-[1.05] text-[#442317] md:text-[2.15rem]">
            来吵这一题
          </h3>

          <p className="mt-3 max-w-[14rem] line-clamp-3 text-sm leading-6 text-[#6E4737]">
            {title}
          </p>

          {description ? (
            <p className="mt-2 max-w-[13rem] line-clamp-2 text-xs leading-5 text-[#936851]">
              {description}
            </p>
          ) : null}

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#C9855E] bg-white/80 px-4 py-2 text-sm text-[#6B351E] shadow-[0_10px_20px_-16px_rgba(107,53,30,0.55)] transition group-hover:border-[#A5522B] group-hover:text-[#8D3E19]">
            去贴纸条
            <span aria-hidden="true" className="text-base transition group-hover:translate-x-0.5">
              →
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
