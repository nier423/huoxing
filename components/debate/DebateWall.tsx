"use client";

import type { MutableRefObject, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";

type Stance = "pro" | "con";

interface NoteItem {
  id: number;
  stance: Stance;
  text: string;
  color: string;
  rotate: number;
  x: number;
  y: number;
  likes: number;
  zIndex: number;
  entered: boolean;
  clearMode: boolean;
  clearX: number;
  clearY: number;
  entryOffsetX: number;
  entryOffsetY: number;
}

interface AreaMetrics {
  width: number;
  height: number;
  left: number;
  top: number;
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const NOTE_COLORS = ["#F5C9CC", "#BFD9EE", "#F3E58F", "#C9E4A9", "#F4D7A7", "#E5CCF2"];
const HOT_LIKE_THRESHOLD = 5;
const MAX_CHAR_LIMIT = 100;
const MIN_BOARD_HEIGHT = 860;
const MOBILE_MIN_AREA_HEIGHT = 360;
const OVERLAP_RATIO_LIMIT = 0.25;
const MOBILE_OVERLAP_RATIO_LIMIT = 0.2;
const NOTE_SAFE_PADDING = 14;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function getNoteSize(text: string, compact = false) {
  const len = text.length;
  if (compact) {
    const width = len >= 56 ? 212 : len >= 28 ? 198 : 186;
    const fontSize = 14;
    const lineHeight = Math.round(fontSize * 1.72);
    const approxCharsPerLine = width >= 212 ? 11 : width >= 198 ? 10 : 9;
    const paragraphs = text.split("\n");
    const lines = Math.max(
      1,
      paragraphs.reduce((total, paragraph) => {
        const contentLength = paragraph.trim().length || 1;
        return total + Math.ceil(contentLength / approxCharsPerLine);
      }, 0),
    );
    const minHeight = Math.max(118, lines * lineHeight + 54);

    return { width, minHeight, fontSize };
  }
  if (len >= 80) return { width: 272, minHeight: 306, fontSize: 17 };
  if (len >= 56) return { width: 246, minHeight: 258, fontSize: 16 };
  if (len >= 36) return { width: 220, minHeight: 214, fontSize: 15 };
  return { width: 188, minHeight: 170, fontSize: 15 };
}

function getRect(note: NoteItem, areaWidth: number, compact = false): Rect {
  const size = getNoteSize(note.text, compact);
  return {
    left: (note.x / 100) * areaWidth,
    top: note.y,
    width: size.width,
    height: size.minHeight,
  };
}

function overlapArea(a: Rect, b: Rect) {
  const overlapW = Math.max(0, Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left));
  const overlapH = Math.max(0, Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top));
  return overlapW * overlapH;
}

function isPlacementValid(candidate: Rect, existing: Rect[], ratioLimit = OVERLAP_RATIO_LIMIT) {
  return existing.every((item) => {
    const overlap = overlapArea(candidate, item);
    if (overlap <= 0) {
      return true;
    }
    const ratio = overlap / Math.min(candidate.width * candidate.height, item.width * item.height);
    return ratio <= ratioLimit;
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getBoundedNotePosition(
  note: NoteItem,
  areaWidth: number,
  areaHeight: number,
  compact = false,
) {
  const size = getNoteSize(note.text, compact);
  const safeWidth = Math.max(areaWidth, size.width + NOTE_SAFE_PADDING * 2);
  const safeHeight = Math.max(areaHeight, size.minHeight + NOTE_SAFE_PADDING * 2);
  const maxLeft = Math.max(NOTE_SAFE_PADDING, safeWidth - size.width - NOTE_SAFE_PADDING);
  const maxTop = Math.max(NOTE_SAFE_PADDING, safeHeight - size.minHeight - NOTE_SAFE_PADDING);
  const leftPx = clamp((note.x / 100) * safeWidth, NOTE_SAFE_PADDING, maxLeft);
  const topPx = clamp(note.y, NOTE_SAFE_PADDING, maxTop);

  return {
    leftPercent: (leftPx / safeWidth) * 100,
    topPx,
  };
}

function getPlacementRect(
  x: number,
  y: number,
  text: string,
  areaWidth: number,
  areaHeight: number,
  compact = false,
): Rect {
  const bounded = getBoundedNotePosition(
    {
      id: -1,
      stance: "pro",
      text,
      color: "",
      rotate: 0,
      x,
      y,
      likes: 0,
      zIndex: 0,
      entered: true,
      clearMode: false,
      clearX: 0,
      clearY: 0,
      entryOffsetX: 0,
      entryOffsetY: 0,
    },
    areaWidth,
    areaHeight,
    compact,
  );
  const size = getNoteSize(text, compact);

  return {
    left: (bounded.leftPercent / 100) * areaWidth,
    top: bounded.topPx,
    width: size.width,
    height: size.minHeight,
  };
}

function buildMobileNoteLayout(notes: NoteItem[], areaWidth: number) {
  const safeWidth = Math.max(areaWidth, 260);
  const sortedNotes = [...notes].sort((left, right) => {
    if (left.y !== right.y) {
      return left.y - right.y;
    }

    return left.id - right.id;
  });

  let currentY = NOTE_SAFE_PADDING;
  let previousRect: Rect | null = null;

  const positionedNotes = sortedNotes.map((note, index) => {
    const size = getNoteSize(note.text, true);
    const maxLeft = Math.max(NOTE_SAFE_PADDING, safeWidth - size.width - NOTE_SAFE_PADDING);
    const centerLeft = (safeWidth - size.width) / 2;
    const jitter = index % 3 === 0 ? -14 : index % 3 === 1 ? 10 : -4;
    const leftPx = clamp(centerLeft + jitter, NOTE_SAFE_PADDING, maxLeft);
    let topY = currentY;

    if (previousRect) {
      const maxOverlapHeight = Math.floor(Math.min(previousRect.height, size.minHeight) * MOBILE_OVERLAP_RATIO_LIMIT);
      const desiredTop = previousRect.top + previousRect.height - maxOverlapHeight;
      topY = Math.max(currentY, desiredTop);
    }

    const nextNote = {
      ...note,
      x: (leftPx / safeWidth) * 100,
      y: topY,
    };

    previousRect = {
      left: leftPx,
      top: topY,
      width: size.width,
      height: size.minHeight,
    };
    currentY = topY + Math.floor(size.minHeight * (1 - MOBILE_OVERLAP_RATIO_LIMIT)) + 12;

    return nextNote;
  });

  return {
    notes: positionedNotes,
    height: Math.max(MOBILE_MIN_AREA_HEIGHT, currentY + NOTE_SAFE_PADDING),
  };
}

declare global {
  interface Window {
    clearAllNotes?: () => void;
  }
}

const seededNotes: NoteItem[] = [
  {
    id: 1,
    stance: "pro",
    text: "礼貌让渡不是特权本身，关键是它是否伴随平等机会。",
    color: NOTE_COLORS[0],
    rotate: -4,
    x: 7,
    y: 42,
    likes: 2,
    zIndex: 3,
    entered: true,
    clearMode: false,
    clearX: 0,
    clearY: 0,
    entryOffsetX: 0,
    entryOffsetY: 0,
  },
  {
    id: 2,
    stance: "pro",
    text: "尊重可以保留，但不应假定女性天然弱势。",
    color: NOTE_COLORS[1],
    rotate: 5,
    x: 56,
    y: 18,
    likes: 4,
    zIndex: 2,
    entered: true,
    clearMode: false,
    clearX: 0,
    clearY: 0,
    entryOffsetX: 0,
    entryOffsetY: 0,
  },
  {
    id: 3,
    stance: "con",
    text: "如果默认女性需要被照顾，就会持续加深刻板印象。",
    color: NOTE_COLORS[3],
    rotate: -3,
    x: 8,
    y: 30,
    likes: 6,
    zIndex: 4,
    entered: true,
    clearMode: false,
    clearX: 0,
    clearY: 0,
    entryOffsetX: 0,
    entryOffsetY: 0,
  },
  {
    id: 4,
    stance: "con",
    text: "平权需要规则一致，而不是礼让只指向一个性别。",
    color: NOTE_COLORS[2],
    rotate: 6,
    x: 54,
    y: 260,
    likes: 1,
    zIndex: 1,
    entered: true,
    clearMode: false,
    clearX: 0,
    clearY: 0,
    entryOffsetX: 0,
    entryOffsetY: 0,
  },
];

export default function DebateWall() {
  const [notes, setNotes] = useState<NoteItem[]>(seededNotes);
  const [isModalOpen, setModalOpen] = useState(false);
  const [stance, setStance] = useState<Stance>("pro");
  const [draft, setDraft] = useState("");
  const [maxZ, setMaxZ] = useState(8);
  const [focusedId, setFocusedId] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [boardHeight, setBoardHeight] = useState(MIN_BOARD_HEIGHT);
  const [isMobile, setIsMobile] = useState(false);

  const nextIdRef = useRef(100);
  const sourceButtonRef = useRef<HTMLButtonElement | null>(null);
  const proRef = useRef<HTMLDivElement | null>(null);
  const conRef = useRef<HTMLDivElement | null>(null);

  const [metrics, setMetrics] = useState<Record<Stance, AreaMetrics>>({
    pro: { width: 0, height: 0, left: 0, top: 0 },
    con: { width: 0, height: 0, left: 0, top: 0 },
  });

  const refreshMetrics = useCallback(() => {
    if (!proRef.current || !conRef.current) {
      return;
    }
    const proRect = proRef.current.getBoundingClientRect();
    const conRect = conRef.current.getBoundingClientRect();
    setMetrics({
      pro: {
        width: proRect.width,
        height: proRect.height,
        left: proRect.left,
        top: proRect.top,
      },
      con: {
        width: conRect.width,
        height: conRect.height,
        left: conRect.left,
        top: conRect.top,
      },
    });
  }, []);

  useEffect(() => {
    refreshMetrics();
    window.addEventListener("resize", refreshMetrics);
    return () => window.removeEventListener("resize", refreshMetrics);
  }, [refreshMetrics]);

  useEffect(() => {
    const updateViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const maxBottom = notes.reduce((acc, note) => {
      const size = getNoteSize(note.text);
      return Math.max(acc, note.y + size.minHeight + 110);
    }, MIN_BOARD_HEIGHT);

    if (maxBottom > boardHeight - 20) {
      setBoardHeight(Math.ceil(maxBottom));
    }
  }, [boardHeight, notes]);

  const pickPlacement = useCallback(
    (stanceType: Stance, text: string) => {
      const area = metrics[stanceType];
      const areaWidth = area.width > 0 ? area.width : 520;
      const areaHeight = area.height > 0 ? area.height : isMobile ? MOBILE_MIN_AREA_HEIGHT : boardHeight;
      const size = getNoteSize(text, isMobile);
      const minX = ((NOTE_SAFE_PADDING / areaWidth) * 100);
      const maxX = Math.max(minX, ((areaWidth - size.width - NOTE_SAFE_PADDING) / areaWidth) * 100);
      const minY = 28;
      const maxY = Math.max(minY, areaHeight - size.minHeight - NOTE_SAFE_PADDING);

      const existingRects = notes
        .filter((item) => item.stance === stanceType)
        .map((item) => {
          const bounded = getBoundedNotePosition(item, areaWidth, areaHeight, isMobile);
          return {
            left: (bounded.leftPercent / 100) * areaWidth,
            top: bounded.topPx,
            width: getNoteSize(item.text, isMobile).width,
            height: getNoteSize(item.text, isMobile).minHeight,
          };
        });

      for (let i = 0; i < 120; i += 1) {
        const x = randomBetween(minX, maxX);
        const y = randomBetween(minY, maxY);
        const candidate = getPlacementRect(x, y, text, areaWidth, areaHeight, isMobile);
        if (isPlacementValid(candidate, existingRects, isMobile ? MOBILE_OVERLAP_RATIO_LIMIT : OVERLAP_RATIO_LIMIT)) {
          return { x, y, rotate: randomBetween(-6, 6) };
        }
      }

      const bottom = existingRects.reduce((acc, rect) => Math.max(acc, rect.top + rect.height), 24);
      const fallbackY = bottom + randomBetween(22, 36);
      const laneCount = Math.max(1, Math.floor((areaWidth - NOTE_SAFE_PADDING * 2) / Math.max(size.width * 0.82, 150)));
      const laneIndex = existingRects.length % laneCount;
      const laneGap = laneCount > 1 ? (maxX - minX) / (laneCount - 1) : 0;
      const fallbackX = clamp(minX + laneIndex * laneGap, minX, maxX);

      return {
        x: fallbackX,
        y: fallbackY,
        rotate: randomBetween(-4, 4),
      };
    },
    [boardHeight, isMobile, metrics, notes],
  );

  const addNote = useCallback(() => {
    const rawText = draft.trim();
    if (!rawText || isClearing) {
      return;
    }

    const text = rawText.slice(0, MAX_CHAR_LIMIT);
    const placement = pickPlacement(stance, text);
    const target = metrics[stance];

    const sourceRect = sourceButtonRef.current?.getBoundingClientRect();
    const sourceX = (sourceRect?.left ?? window.innerWidth * 0.5) + (sourceRect?.width ?? 0) / 2;
    const sourceY = (sourceRect?.top ?? window.innerHeight - 90) + (sourceRect?.height ?? 0) / 2;

    const targetX = ((placement.x / 100) * (target.width || 520));
    const entryOffsetX = sourceX - target.left - targetX;
    const entryOffsetY = sourceY - target.top - placement.y;

    const id = nextIdRef.current++;
    const nextZ = maxZ + 1;

    const newNote: NoteItem = {
      id,
      stance,
      text,
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      rotate: placement.rotate,
      x: placement.x,
      y: placement.y,
      likes: 0,
      zIndex: nextZ,
      entered: false,
      clearMode: false,
      clearX: 0,
      clearY: 0,
      entryOffsetX,
      entryOffsetY,
    };

    setMaxZ(nextZ);
    setActiveId(id);
    setNotes((prev) => [...prev, newNote]);
    setDraft("");
    setModalOpen(false);

    window.setTimeout(() => {
      setNotes((prev) => prev.map((item) => (item.id === id ? { ...item, entered: true } : item)));
    }, 860);
  }, [draft, isClearing, maxZ, metrics, pickPlacement, stance]);

  const bringToFront = (id: number) => {
    if (activeId === id) {
      setActiveId(null);
      return;
    }

    const nextZ = maxZ + 1;
    setMaxZ(nextZ);
    setFocusedId(id);
    setActiveId(id);
    setNotes((prev) => prev.map((item) => (item.id === id ? { ...item, zIndex: nextZ } : item)));
    window.setTimeout(() => setFocusedId(null), 420);
  };

  const likeNote = (id: number) => {
    setNotes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, likes: Math.max(0, item.likes + 1) } : item)),
    );
  };

  const clearAllNotes = useCallback(() => {
    if (isClearing || notes.length === 0) {
      return;
    }
    setIsClearing(true);
    setActiveId(null);
    setNotes((prev) =>
      prev.map((item) => ({
        ...item,
        clearMode: true,
        clearX: randomBetween(-280, 280),
        clearY: randomBetween(-260, 220),
      })),
    );

    window.setTimeout(() => {
      setNotes([]);
      setIsClearing(false);
      setBoardHeight(MIN_BOARD_HEIGHT);
    }, 700);
  }, [isClearing, notes.length]);

  useEffect(() => {
    window.clearAllNotes = clearAllNotes;
    return () => {
      delete window.clearAllNotes;
    };
  }, [clearAllNotes]);

  const grouped = useMemo(
    () => ({
      pro: notes.filter((note) => note.stance === "pro"),
      con: notes.filter((note) => note.stance === "con"),
    }),
    [notes],
  );

  const mobileLayouts = useMemo(() => {
    return {
      pro: buildMobileNoteLayout(grouped.pro, metrics.pro.width || 320),
      con: buildMobileNoteLayout(grouped.con, metrics.con.width || 320),
    };
  }, [grouped.con, grouped.pro, metrics.con.width, metrics.pro.width]);

  return (
    <main className="min-h-screen bg-[#FDFBF7] pb-24 pt-28 text-[#3F352C]" onClick={() => setActiveId(null)}>
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9A8069]">Debate Wall</p>
          <h1 className="mt-2 font-youyou text-3xl leading-tight md:text-5xl">第一辩题 · “女士优先”有助平权吗？</h1>
        </header>

        <section
          className="relative mt-8 rounded-[2rem] border border-[#EFE4D3] bg-[linear-gradient(180deg,rgba(255,252,246,0.96),rgba(250,244,235,0.96))] px-3 py-6 shadow-[0_24px_60px_-48px_rgba(56,39,24,0.45)] md:mt-10 md:px-6 md:py-8"
          style={{ minHeight: isMobile ? undefined : `${boardHeight + 80}px` }}
        >
          <div className="pointer-events-none absolute left-0 right-0 top-5 hidden grid-cols-2 text-center md:grid">
            <h3 className="font-youyou text-xl text-[#2F241A] md:text-3xl">正方</h3>
            <h3 className="font-youyou text-xl text-[#2F241A] md:text-3xl">反方</h3>
          </div>
          <div className="pointer-events-none absolute bottom-6 left-1/2 top-20 hidden w-px -translate-x-1/2 bg-[#D7D3CC] md:block" />

          <div className="relative mt-20 hidden md:block" style={{ height: `${boardHeight}px` }}>
            <div ref={proRef} className="absolute inset-y-0 left-0 w-1/2 overflow-visible" />
            <div ref={conRef} className="absolute inset-y-0 right-0 w-1/2 overflow-visible" />

            <NotesLayer
              notes={grouped.pro}
              focusedId={focusedId}
              activeId={activeId}
              onLike={likeNote}
              onBringFront={bringToFront}
              side="left"
              areaWidth={metrics.pro.width}
              areaHeight={boardHeight}
            />
            <NotesLayer
              notes={grouped.con}
              focusedId={focusedId}
              activeId={activeId}
              onLike={likeNote}
              onBringFront={bringToFront}
              side="right"
              areaWidth={metrics.con.width}
              areaHeight={boardHeight}
            />
          </div>

          <div className="space-y-6 md:hidden">
            <MobileNotesSection
              title="正方"
              subtitle="支持“女士优先”有助平权"
              areaHeight={mobileLayouts.pro.height}
              areaRef={proRef}
              noteCount={grouped.pro.length}
            >
              <NotesLayer
                notes={mobileLayouts.pro.notes}
                focusedId={focusedId}
                activeId={activeId}
                onLike={likeNote}
                onBringFront={bringToFront}
                side="left"
                compact
                stacked
                areaWidth={metrics.pro.width}
                areaHeight={mobileLayouts.pro.height}
              />
            </MobileNotesSection>
            <MobileNotesSection
              title="反方"
              subtitle="认为它可能强化刻板印象"
              areaHeight={mobileLayouts.con.height}
              areaRef={conRef}
              noteCount={grouped.con.length}
            >
              <NotesLayer
                notes={mobileLayouts.con.notes}
                focusedId={focusedId}
                activeId={activeId}
                onLike={likeNote}
                onBringFront={bringToFront}
                side="right"
                compact
                stacked
                areaWidth={metrics.con.width}
                areaHeight={mobileLayouts.con.height}
              />
            </MobileNotesSection>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[calc(100%-1.5rem)] max-w-fit items-center justify-center rounded-full border border-[#9FB8D5] bg-[#83A9D0]/95 px-2 py-2 shadow-[0_16px_36px_-20px_rgba(0,0,0,0.5)] backdrop-blur md:bottom-7 md:w-fit md:px-3">
        <button
          ref={sourceButtonRef}
          onClick={(event) => {
            event.stopPropagation();
            setModalOpen(true);
          }}
          className="w-full rounded-full px-6 py-2 text-lg font-youyou text-white transition hover:bg-[#6E96C0] md:w-auto md:px-8 md:text-xl"
        >
          我要发言
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ y: 26, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-[#E6DAC6] bg-[#FFFDF9] p-4 shadow-2xl md:p-5"
            >
              <h2 className="font-youyou text-xl text-[#43372C] md:text-2xl">发布一张贴纸</h2>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {(["pro", "con"] as Stance[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => setStance(item)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      stance === item
                        ? "bg-[#E58E3A] text-white"
                        : "bg-[#F4ECE1] text-[#7B6650] hover:bg-[#ECDDCA]"
                    }`}
                  >
                    {item === "pro" ? "正方" : "反方"}
                  </button>
                ))}
              </div>

              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, MAX_CHAR_LIMIT))}
                placeholder="写下你的观点（最多 100 字）..."
                className="mt-4 h-32 w-full resize-none rounded-xl border border-[#E7DCCB] bg-[#FFFDF8] p-3 text-sm text-[#4D4136] outline-none focus:border-[#E58E3A]"
              />
              <div className="mt-2 text-right text-xs text-[#9E856E]">{draft.length}/100</div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-full px-4 py-2 text-sm text-[#7F6A53] transition hover:bg-[#F4ECE0]"
                >
                  取消
                </button>
                <button
                  onClick={addNote}
                  className="rounded-full bg-[#E58E3A] px-5 py-2 text-sm text-white transition hover:bg-[#D4761D]"
                >
                  发送
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

interface MobileNotesSectionProps {
  title: string;
  subtitle: string;
  areaHeight: number;
  areaRef: MutableRefObject<HTMLDivElement | null>;
  children: ReactNode;
  noteCount: number;
}

function MobileNotesSection({
  title,
  subtitle,
  areaHeight,
  areaRef,
  children,
  noteCount,
}: MobileNotesSectionProps) {
  return (
    <section className="overflow-hidden rounded-[1.7rem] border border-[#E8DCC9] bg-[linear-gradient(180deg,rgba(255,252,246,0.96),rgba(249,242,233,0.96))] p-4 shadow-[0_18px_40px_-32px_rgba(56,39,24,0.45)]">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h3 className="font-youyou text-2xl text-[#2F241A]">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-[#8A715B]">{subtitle}</p>
        </div>
        <span className="rounded-full bg-[#F5EBDD] px-3 py-1 text-xs text-[#7A644D]">{noteCount} 张</span>
      </div>

      <div className="relative overflow-hidden rounded-[1.4rem] border border-[#E9DDCC] bg-[#FFFDF8]/85 px-2 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
        <div
          ref={areaRef}
          className="relative w-full overflow-hidden"
          style={{ height: `${areaHeight}px` }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

interface NotesLayerProps {
  notes: NoteItem[];
  focusedId: number | null;
  activeId: number | null;
  onLike: (id: number) => void;
  onBringFront: (id: number) => void;
  side: "left" | "right";
  compact?: boolean;
  stacked?: boolean;
  areaWidth?: number;
  areaHeight?: number;
}

function NotesLayer({
  notes,
  focusedId,
  activeId,
  onLike,
  onBringFront,
  side,
  compact = false,
  stacked = false,
  areaWidth,
  areaHeight,
}: NotesLayerProps) {
  const fallbackWidth = compact ? 320 : 520;
  const resolvedWidth = areaWidth && areaWidth > 0 ? areaWidth : fallbackWidth;
  const resolvedHeight = areaHeight && areaHeight > 0 ? areaHeight : compact ? MOBILE_MIN_AREA_HEIGHT : MIN_BOARD_HEIGHT;

  return (
    <div
      className={
        stacked
          ? "absolute inset-0 overflow-hidden"
          : `absolute inset-y-0 w-1/2 overflow-hidden ${side === "left" ? "left-0" : "right-0"}`
      }
    >
      <AnimatePresence>
        {notes.map((note) => {
          const isHot = note.likes > HOT_LIKE_THRESHOLD;
          const isFocused = focusedId === note.id;
          const showActions = activeId === note.id;
          const noteSize = getNoteSize(note.text, compact);
          const boundedPosition = getBoundedNotePosition(note, resolvedWidth, resolvedHeight, compact);

          return (
            <motion.article
              key={note.id}
              onClick={(event) => {
                event.stopPropagation();
                onBringFront(note.id);
              }}
              initial={{
                opacity: 0,
                x: note.entryOffsetX,
                y: note.entryOffsetY,
                scale: 0.3,
                rotate: note.rotate * 0.25,
              }}
              animate={
                note.clearMode
                  ? {
                      opacity: 0,
                      x: note.clearX,
                      y: note.clearY,
                      scale: 0.5,
                      rotate: note.rotate + randomBetween(-35, 35),
                    }
                  : note.entered
                    ? {
                        opacity: 1,
                        x: 0,
                        y: isFocused ? -8 : 0,
                        scale: isHot ? 1.1 : 1,
                        rotate: note.rotate,
                      }
                    : {
                        opacity: [0, 1, 1],
                        x: [note.entryOffsetX, note.entryOffsetX * 0.45, 0],
                        y: [note.entryOffsetY, note.entryOffsetY * 0.16, 0],
                        scale: [0.3, 1.04, isHot ? 1.1 : 1],
                        rotate: [note.rotate * 0.25, note.rotate * 1.2, note.rotate],
                      }
              }
              transition={
                note.clearMode
                  ? { duration: 0.68, ease: "easeIn" }
                  : note.entered
                    ? { type: "spring", stiffness: 260, damping: 22, mass: 0.75 }
                    : { duration: 0.92, ease: [0.19, 0.85, 0.3, 0.99] }
              }
              className={`absolute cursor-pointer rounded-sm border border-black/10 ${compact ? "p-3" : "p-4"}`}
              style={{
                backgroundColor: note.color,
                left: `${boundedPosition.leftPercent}%`,
                top: `${boundedPosition.topPx}px`,
                width: `${noteSize.width}px`,
                minHeight: `${noteSize.minHeight}px`,
                zIndex: note.zIndex,
                boxShadow: "0 10px 20px -10px rgba(0,0,0,0.48)",
                transformOrigin: "center",
              }}
            >
              {isHot ? (
                <motion.span
                  className="pointer-events-none absolute inset-[-10px] -z-10 rounded-xl"
                  style={{ background: "radial-gradient(circle, rgba(255,209,145,0.5) 0%, rgba(255,209,145,0) 72%)" }}
                  animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.75, 0.45] }}
                  transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : null}

              <p
                className="font-note break-words whitespace-pre-wrap text-[#2F2A25]"
                style={{ fontSize: `${noteSize.fontSize}px`, lineHeight: compact ? 1.65 : 1.72 }}
              >
                {note.text}
              </p>

              <div
                className={`pointer-events-none absolute flex items-center gap-1 text-[#6E6254] ${
                  compact ? "bottom-2.5 right-2.5" : "bottom-3 right-3"
                }`}
              >
                <Heart className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} strokeWidth={1.8} />
                <span className={compact ? "text-[11px]" : "text-xs"}>{note.likes}</span>
              </div>

              <AnimatePresence>
                {showActions ? (
                  <motion.div
                    initial={{ opacity: 0, x: -8, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -8, scale: 0.96 }}
                    className={`absolute z-[999] flex flex-col gap-1 rounded-full border border-[#DECBB1] bg-[#FFF8EE] px-3 py-1.5 shadow-xl ${
                      compact
                        ? "bottom-3 left-3"
                        : "bottom-4 left-4"
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLike(note.id);
                      }}
                      className="whitespace-nowrap text-xs leading-none text-[#6B5846]"
                    >
                      点赞
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
