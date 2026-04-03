"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DrawingImageSwiperProps {
  /** 静态资源路径，如 `/drawing-gallery/01.webp`（文件放在 `public/drawing-gallery/`） */
  images: string[];
  altPrefix?: string;
}

/**
 * 横向滑动看图：touch / 鼠标拖动滚动，CSS scroll-snap 对齐；左右箭头在漫画外侧，不压在图上。
 */
export default function DrawingImageSwiper({
  images,
  altPrefix = "画里话外",
}: DrawingImageSwiperProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const epsilon = 4;
    setCanPrev(scrollLeft > epsilon);
    setCanNext(scrollLeft < scrollWidth - clientWidth - epsilon);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [images.length, updateScrollState]);

  const scrollBySlide = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const slide = el.querySelector<HTMLElement>("[data-drawing-slide]");
    const gap = 16;
    const w = slide?.getBoundingClientRect().width ?? el.clientWidth * 0.92;
    el.scrollBy({
      left: direction * (w + gap),
      behavior: "smooth",
    });
  };

  if (images.length === 0) {
    return (
      <div className="flex aspect-[21/9] min-h-[160px] items-center justify-center rounded-[2rem] border border-dashed border-[#D7CCC8] bg-white/50 px-6 text-center text-sm text-[#8D8D8D]">
        尚未配置轮播图。请将图片放入{" "}
        <code className="rounded bg-[#F7F5F0] px-1.5 py-0.5 font-mono text-xs">
          public/drawing-gallery/
        </code>
        ，并在{" "}
        <code className="rounded bg-[#F7F5F0] px-1.5 py-0.5 font-mono text-xs">
          lib/drawing-gallery.ts
        </code>{" "}
        的数组中填写路径（如 /drawing-gallery/01.webp）。
      </div>
    );
  }

  const showArrows = images.length > 1;

  const arrowBtnClass =
    "shrink-0 self-center rounded-full border border-[#E8E4DF] bg-white p-2 text-[#7C746D] shadow-sm transition hover:border-[#A1887F] hover:text-[#A1887F] disabled:pointer-events-none disabled:opacity-25 md:p-2.5";

  return (
    <div className="-mx-1">
      <div
        className={`flex items-center ${showArrows ? "gap-1 sm:gap-2 md:gap-3" : ""}`}
      >
        {showArrows ? (
          <button
            type="button"
            aria-label="上一张"
            disabled={!canPrev}
            onClick={() => scrollBySlide(-1)}
            className={arrowBtnClass}
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.8} />
          </button>
        ) : null}

        <div
          ref={scrollRef}
          className="min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex w-max gap-4">
            {images.map((src, index) => (
              <div
                key={`${src}-${index}`}
                data-drawing-slide
                className="shrink-0 snap-center snap-always"
              >
                <div className="inline-block max-w-[min(100%,520px)] overflow-hidden rounded-[2rem] border border-[#E8E4DF] bg-[#F7F5F0] shadow-sm sm:max-w-[min(92vw,520px)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${altPrefix} ${index + 1}`}
                    className="block h-auto max-h-[85vh] w-full max-w-[min(92vw,520px)] object-contain"
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {showArrows ? (
          <button
            type="button"
            aria-label="下一张"
            disabled={!canNext}
            onClick={() => scrollBySlide(1)}
            className={arrowBtnClass}
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.8} />
          </button>
        ) : null}
      </div>
      <p className="mt-3 text-center text-xs text-[#9E9E9E]">
        点击两侧箭头或左右滑动查看更多
      </p>
    </div>
  );
}
