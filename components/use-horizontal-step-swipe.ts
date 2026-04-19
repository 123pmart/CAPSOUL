"use client";

import { useMemo, useRef, type TouchEvent } from "react";

type UseHorizontalStepSwipeOptions = {
  onNext: () => void;
  onPrevious: () => void;
  disabled?: boolean;
  threshold?: number;
};

export function useHorizontalStepSwipe({
  onNext,
  onPrevious,
  disabled = false,
  threshold = 48,
}: UseHorizontalStepSwipeOptions) {
  const touchOriginRef = useRef<{ x: number; y: number } | null>(null);

  return useMemo(
    () => ({
      onTouchStart: (event: TouchEvent<HTMLElement>) => {
        if (disabled) {
          touchOriginRef.current = null;
          return;
        }

        const point = event.touches[0];

        if (!point) {
          touchOriginRef.current = null;
          return;
        }

        touchOriginRef.current = { x: point.clientX, y: point.clientY };
      },
      onTouchEnd: (event: TouchEvent<HTMLElement>) => {
        if (disabled || !touchOriginRef.current) {
          return;
        }

        const point = event.changedTouches[0];
        const origin = touchOriginRef.current;
        touchOriginRef.current = null;

        if (!point) {
          return;
        }

        const deltaX = point.clientX - origin.x;
        const deltaY = point.clientY - origin.y;

        if (Math.abs(deltaX) < threshold || Math.abs(deltaX) <= Math.abs(deltaY) * 1.15) {
          return;
        }

        if (deltaX < 0) {
          onNext();
          return;
        }

        onPrevious();
      },
    }),
    [disabled, onNext, onPrevious, threshold],
  );
}
