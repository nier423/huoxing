"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  articleId: string;
}

export default function ViewTracker({ articleId }: ViewTrackerProps) {
  useEffect(() => {
    if (!articleId) return;
    const key = `viewed:${articleId}`;
    if (sessionStorage.getItem(key)) return;

    sessionStorage.setItem(key, "1");
    void fetch(`/api/articles/${articleId}/view`, {
      method: "POST",
    });
  }, [articleId]);

  return null;
}
