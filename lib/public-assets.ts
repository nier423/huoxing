import "server-only";

import { existsSync } from "fs";
import path from "path";

const RASTER_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

export function getPreferredPublicImagePath(src?: string | null) {
  if (!src) {
    return null;
  }

  if (!src.startsWith("/")) {
    return src;
  }

  const extension = path.extname(src).toLowerCase();
  if (!RASTER_EXTENSIONS.has(extension)) {
    return src;
  }

  const optimizedPath = `${src.slice(0, -extension.length)}.webp`;
  const absoluteOptimizedPath = path.join(
    process.cwd(),
    "public",
    optimizedPath.replace(/^\//, "")
  );

  return existsSync(absoluteOptimizedPath) ? optimizedPath : src;
}
