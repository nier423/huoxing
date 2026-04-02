"use client";

import { useState } from "react";
import type { DebateTopicStatus } from "@/lib/debate-schedule";
import HomeDebateEntry from "@/components/debate/HomeDebateEntry";

interface DebateEntryItem {
  href: string;
  issueLabel?: string | null;
  title: string;
  description?: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: DebateTopicStatus;
}

interface HomeDebateEntryRailProps {
  entries: DebateEntryItem[];
}

function getFeaturedEntryIndex(entries: DebateEntryItem[]) {
  const launchedIndex = entries.findIndex((entry) => entry.status !== "not_started");

  if (launchedIndex !== -1) {
    return launchedIndex;
  }

  return 0;
}

export default function HomeDebateEntryRail({
  entries,
}: HomeDebateEntryRailProps) {
  const allLaunched =
    entries.length > 0 && entries.every((entry) => entry.status !== "not_started");
  const featuredIndex = allLaunched ? null : getFeaturedEntryIndex(entries);
  const [activeIndex, setActiveIndex] = useState<number | null>(featuredIndex);
  const highlightOnHover = allLaunched && entries.length > 1;

  function handleActivate(index: number) {
    if (!highlightOnHover) {
      return;
    }

    setActiveIndex(index);
  }

  function handleReset() {
    if (!highlightOnHover) {
      return;
    }

    setActiveIndex(featuredIndex);
  }

  return (
    <div
      className="grid gap-6 md:grid-cols-2 xl:flex xl:items-stretch"
      onMouseLeave={handleReset}
    >
      {entries.map((entry, index) => {
        const isActive = activeIndex === index;
        const hasActiveEntry = activeIndex !== null;
        const widthClass = isActive
          ? "xl:flex-[1.45] xl:-translate-y-2"
          : hasActiveEntry
            ? "xl:flex-[0.85]"
            : "xl:flex-1";

        return (
          <div
            key={entry.href}
            className={`w-full transition-[flex,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] xl:min-w-0 ${widthClass}`}
            onMouseEnter={() => handleActivate(index)}
            onFocus={() => handleActivate(index)}
            onBlur={handleReset}
          >
            <HomeDebateEntry
              href={entry.href}
              issueLabel={entry.issueLabel}
              title={entry.title}
              description={entry.description}
              startsAt={entry.startsAt}
              endsAt={entry.endsAt}
              status={entry.status}
              isActive={isActive}
            />
          </div>
        );
      })}
    </div>
  );
}
