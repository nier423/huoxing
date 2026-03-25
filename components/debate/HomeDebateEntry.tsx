"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const previewColors = ["#FADADD", "#DFF2E1", "#FFE8BF", "#DDE9FF", "#F4E1FF"];

export default function HomeDebateEntry() {
  return (
    <section className="mx-auto mt-16 w-full max-w-5xl px-6 pb-12 md:pb-16">
      <Link href="/debate/ladies-first" className="block">
        <motion.article
          whileHover="hover"
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="group relative overflow-hidden rounded-2xl border border-[#E8E2D7] bg-[#FDFBF7] p-5 shadow-[0_14px_40px_-24px_rgba(0,0,0,0.45)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.8),transparent_65%)]" />
          <div className="relative flex items-center gap-4 md:gap-6">
            <div className="relative h-16 w-20 shrink-0 md:h-[4.5rem] md:w-24">
              {previewColors.slice(0, 4).map((color, index) => (
                <motion.div
                  key={color}
                  variants={{
                    hover: {
                      x: index * 4 - 4,
                      y: index % 2 === 0 ? -index * 2 : index * 2,
                      rotate: index % 2 === 0 ? -8 + index * 2 : 7 - index * 2,
                    },
                  }}
                  className="absolute left-0 top-0 h-14 w-16 rounded-md border border-black/5"
                  style={{
                    backgroundColor: color,
                    transform: `translate(${index * 5}px, ${index * 2}px) rotate(${index % 2 === 0 ? -6 : 6}deg)`,
                    boxShadow: "0 10px 18px -12px rgba(0,0,0,0.42)",
                  }}
                />
              ))}
            </div>

            <div>
              <p className="text-[0.68rem] tracking-[0.32em] text-[#B66A1B] md:text-xs">DEBATE WALL ENTRY</p>
              <h3 className="mt-1 font-youyou text-lg leading-snug text-[#43372C] md:text-2xl">
                当前热议：第一期 · “女士优先”有助平权吗？
              </h3>
            </div>
          </div>
        </motion.article>
      </Link>
    </section>
  );
}
