"use client";

interface DrawingImageSwiperProps {
  /** 静态资源路径，如 `/drawing-gallery/01.webp`（文件放在 `public/drawing-gallery/`） */
  images: string[];
  altPrefix?: string;
}

/**
 * 横向滑动看图：touch / 鼠标拖动滚动，CSS scroll-snap 对齐。
 * 边框随单张图片宽高自适应，完整展示（不裁剪）。
 */
export default function DrawingImageSwiper({
  images,
  altPrefix = "画里话外",
}: DrawingImageSwiperProps) {
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

  return (
    <div className="relative -mx-1">
      <div
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {images.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="shrink-0 snap-center snap-always"
          >
            <div className="inline-block max-w-[min(92vw,520px)] overflow-hidden rounded-[2rem] border border-[#E8E4DF] bg-[#F7F5F0] shadow-sm">
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
      <p className="mt-3 text-center text-xs text-[#9E9E9E]">左右滑动查看更多</p>
    </div>
  );
}
