"use client";

import { useEffect, useState } from "react";

export function useCompactViewport(query = "(max-width: 767px)") {
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const syncCompactViewport = () => {
      setIsCompactViewport(mediaQuery.matches);
    };

    syncCompactViewport();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncCompactViewport);

      return () => {
        mediaQuery.removeEventListener("change", syncCompactViewport);
      };
    }

    mediaQuery.addListener(syncCompactViewport);

    return () => {
      mediaQuery.removeListener(syncCompactViewport);
    };
  }, [query]);

  return isCompactViewport;
}
