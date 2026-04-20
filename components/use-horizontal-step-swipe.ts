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
  const horizontalLockRef = useRef(false);

  return useMemo(
    () => ({
      onTouchStart: (event: TouchEvent<HTMLElement>) => {
        if (disabled) {
          touchOriginRef.current = null;
          horizontalLockRef.current = false;
          return;
        }

        const point = event.touches[0];

        if (!point) {
          touchOriginRef.current = null;
          horizontalLockRef.current = false;
          return;
        }

        touchOriginRef.current = { x: point.clientX, y: point.clientY };
        horizontalLockRef.current = false;
      },
      onTouchMove: (event: TouchEvent<HTMLElement>) => {
        if (disabled || !touchOriginRef.current) {
          return;
        }

        const point = event.touches[0];

        if (!point) {
          return;
        }

        const deltaX = point.clientX - touchOriginRef.current.x;
        const deltaY = point.clientY - touchOriginRef.current.y;

        if (Math.abs(deltaX) < 8) {
          return;
        }

        if (Math.abs(deltaX) > Math.abs(deltaY) * 1.08) {
          horizontalLockRef.current = true;

          if (event.cancelable) {
            event.preventDefault();
          }
        }
      },
      onTouchEnd: (event: TouchEvent<HTMLElement>) => {
        if (disabled || !touchOriginRef.current) {
          return;
        }

        const point = event.changedTouches[0];
        const origin = touchOriginRef.current;
        touchOriginRef.current = null;
        const horizontalLocked = horizontalLockRef.current;
        horizontalLockRef.current = false;

        if (!point) {
          return;
        }

        const deltaX = point.clientX - origin.x;
        const deltaY = point.clientY - origin.y;

        if (!horizontalLocked && Math.abs(deltaX) <= Math.abs(deltaY) * 1.15) {
          return;
        }

        if (Math.abs(deltaX) < threshold) {
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
