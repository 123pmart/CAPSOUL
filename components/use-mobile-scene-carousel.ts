"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

import { useCompactViewport } from "@/components/use-compact-viewport";

type UseMobileSceneCarouselOptions = {
  activeIndex: number;
  slideCount: number;
  onIndexChange: (index: number) => void;
  enabled?: boolean;
};

function clampIndex(index: number, slideCount: number) {
  return Math.max(0, Math.min(slideCount - 1, index));
}

export function useMobileSceneCarousel({
  activeIndex,
  slideCount,
  onIndexChange,
  enabled = true,
}: UseMobileSceneCarouselOptions) {
  const isPhoneViewport = useCompactViewport("(max-width: 767px)");
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const isSyncingRef = useRef(false);

  const clearScrollTimer = useCallback(() => {
    if (scrollTimerRef.current != null) {
      window.clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      clearScrollTimer();
    },
    [clearScrollTimer],
  );

  useEffect(() => {
    if (!enabled || !isPhoneViewport || slideCount <= 1) {
      return;
    }

    const rail = containerRef.current;

    if (!rail) {
      return;
    }

    const slideWidth = rail.clientWidth;

    if (!slideWidth) {
      return;
    }

    const nextLeft = slideWidth * clampIndex(activeIndex, slideCount);

    if (Math.abs(rail.scrollLeft - nextLeft) < 1) {
      return;
    }

    isSyncingRef.current = true;
    rail.scrollTo({
      left: nextLeft,
      behavior: reduceMotion ? "auto" : "smooth",
    });

    const syncTimer = window.setTimeout(() => {
      isSyncingRef.current = false;
    }, reduceMotion ? 0 : 280);

    return () => {
      window.clearTimeout(syncTimer);
    };
  }, [activeIndex, enabled, isPhoneViewport, reduceMotion, slideCount]);

  const syncIndexFromScroll = useCallback(() => {
    const rail = containerRef.current;

    if (!rail) {
      return;
    }

    const slideWidth = rail.clientWidth || 1;
    const nextIndex = clampIndex(Math.round(rail.scrollLeft / slideWidth), slideCount);
    onIndexChange(nextIndex);
  }, [onIndexChange, slideCount]);

  const handleScroll = useCallback(() => {
    if (!enabled || !isPhoneViewport || slideCount <= 1) {
      return;
    }

    clearScrollTimer();

    scrollTimerRef.current = window.setTimeout(() => {
      syncIndexFromScroll();
      isSyncingRef.current = false;
      scrollTimerRef.current = null;
    }, isSyncingRef.current ? 90 : 70);
  }, [clearScrollTimer, enabled, isPhoneViewport, slideCount, syncIndexFromScroll]);

  return {
    containerRef,
    isPhoneViewport,
    carouselBindings:
      enabled && isPhoneViewport && slideCount > 1
        ? {
            onScroll: handleScroll,
          }
        : {},
  };
}
