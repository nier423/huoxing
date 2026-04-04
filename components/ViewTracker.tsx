"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  endpoint: string;
  storageKey: string;
}

export default function ViewTracker({ endpoint, storageKey }: ViewTrackerProps) {
  useEffect(() => {
    if (!endpoint || !storageKey) return;
    if (sessionStorage.getItem(storageKey)) return;

    sessionStorage.setItem(storageKey, "1");
    void fetch(endpoint, {
      method: "POST",
    });
  }, [endpoint, storageKey]);

  return null;
}
