"use client";

import { useCallback, type PointerEvent } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "framer-motion";

function isFinePointer(event: PointerEvent<HTMLElement>) {
  return event.pointerType === "mouse" || event.pointerType === "pen";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function useMagneticMotion(maxOffset = 6) {
  const reduceMotion = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 280, damping: 24, mass: 0.45 });
  const y = useSpring(rawY, { stiffness: 280, damping: 24, mass: 0.45 });

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || !isFinePointer(event)) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const centeredX = event.clientX - rect.left - rect.width / 2;
    const centeredY = event.clientY - rect.top - rect.height / 2;

    rawX.set(clamp(centeredX * 0.14, -maxOffset, maxOffset));
    rawY.set(clamp(centeredY * 0.14, -maxOffset, maxOffset));
  }, [maxOffset, rawX, rawY, reduceMotion]);

  const onPointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return {
    style: reduceMotion ? undefined : { x, y },
    onPointerMove,
    onPointerLeave,
  };
}

export function useCardTiltMotion(maxTilt = 4) {
  const reduceMotion = useReducedMotion();
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { stiffness: 220, damping: 22, mass: 0.55 });
  const rotateY = useSpring(rawRotateY, { stiffness: 220, damping: 22, mass: 0.55 });

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || !isFinePointer(event)) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
    const y = (event.clientY - rect.top) / Math.max(1, rect.height) - 0.5;

    rawRotateX.set(clamp(y * -maxTilt, -maxTilt, maxTilt));
    rawRotateY.set(clamp(x * maxTilt, -maxTilt, maxTilt));
  }, [maxTilt, rawRotateX, rawRotateY, reduceMotion]);

  const onPointerLeave = useCallback(() => {
    rawRotateX.set(0);
    rawRotateY.set(0);
  }, [rawRotateX, rawRotateY]);

  return {
    style: reduceMotion ? undefined : { rotateX, rotateY, transformPerspective: 900 },
    onPointerMove,
    onPointerLeave,
  };
}
