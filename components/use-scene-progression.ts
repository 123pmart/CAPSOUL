"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type TouchEvent, type WheelEvent } from "react";

import {
  progressionIdleResetMs,
  progressionLockMs,
  progressionTouchThreshold,
  progressionWheelThreshold,
} from "@/components/motion-config";

type UseSceneProgressionOptions = {
  stepCount: number;
  initialIndex?: number;
  disabled?: boolean;
  wheelThreshold?: number;
  touchThreshold?: number;
  idleResetMs?: number;
  lockMs?: number;
};

function clampIndex(index: number, stepCount: number) {
  return Math.max(0, Math.min(stepCount - 1, index));
}

function normalizeWheelDelta(deltaY: number, deltaMode: number) {
  if (deltaMode === 1) {
    return deltaY * 18;
  }

  if (deltaMode === 2) {
    return deltaY * window.innerHeight;
  }

  return deltaY;
}

export function isSceneInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element
    ? Boolean(target.closest("a, button, input, textarea, select, label"))
    : false;
}

export function useSceneProgression({
  stepCount,
  initialIndex = 0,
  disabled = false,
  wheelThreshold = progressionWheelThreshold,
  touchThreshold = progressionTouchThreshold,
  idleResetMs = progressionIdleResetMs,
  lockMs = progressionLockMs,
}: UseSceneProgressionOptions) {
  const [activeIndex, setActiveIndex] = useState(() =>
    stepCount > 0 ? clampIndex(initialIndex, stepCount) : 0,
  );
  const wheelBufferRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const lockRef = useRef(false);
  const idleTimerRef = useRef<number | null>(null);
  const lockTimerRef = useRef<number | null>(null);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current != null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const clearLockTimer = useCallback(() => {
    if (lockTimerRef.current != null) {
      window.clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
  }, []);

  const resetWheelBuffer = useCallback(() => {
    wheelBufferRef.current = 0;
    clearIdleTimer();
  }, [clearIdleTimer]);

  const armLock = useCallback(() => {
    clearLockTimer();
    lockRef.current = true;

    lockTimerRef.current = window.setTimeout(() => {
      lockRef.current = false;
    }, lockMs);
  }, [clearLockTimer, lockMs]);

  const goToStep = useCallback(
    (index: number) => {
      if (disabled || stepCount <= 0) {
        return;
      }

      setActiveIndex((current) => clampIndex(index, stepCount));
      resetWheelBuffer();
      armLock();
    },
    [armLock, disabled, resetWheelBuffer, stepCount],
  );

  const resetToStep = useCallback(
    (index: number) => {
      if (stepCount <= 0) {
        return;
      }

      setActiveIndex(clampIndex(index, stepCount));
      resetWheelBuffer();
      clearLockTimer();
      lockRef.current = false;
    },
    [clearLockTimer, resetWheelBuffer, stepCount],
  );

  const moveStep = useCallback(
    (direction: 1 | -1) => {
      if (disabled || stepCount <= 1 || lockRef.current) {
        return false;
      }

      const nextIndex = clampIndex(activeIndex + direction, stepCount);

      if (nextIndex === activeIndex) {
        resetWheelBuffer();
        return false;
      }

      setActiveIndex(nextIndex);
      resetWheelBuffer();
      armLock();
      return true;
    },
    [activeIndex, armLock, disabled, resetWheelBuffer, stepCount],
  );

  useEffect(() => {
    if (stepCount <= 0) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((current) => clampIndex(current, stepCount));
  }, [stepCount]);

  useEffect(
    () => () => {
      clearIdleTimer();
      clearLockTimer();
    },
    [clearIdleTimer, clearLockTimer],
  );

  const handleWheelCapture = useCallback(
    (event: WheelEvent<HTMLElement>) => {
      if (disabled || stepCount <= 1 || isSceneInteractiveTarget(event.target)) {
        return;
      }

      if (event.nativeEvent.cancelable) {
        event.preventDefault();
      }

      const delta = normalizeWheelDelta(event.deltaY, event.deltaMode);

      if (Math.abs(delta) < 0.4) {
        return;
      }

      wheelBufferRef.current += delta;
      clearIdleTimer();

      idleTimerRef.current = window.setTimeout(() => {
        wheelBufferRef.current = 0;
        idleTimerRef.current = null;
      }, idleResetMs);

      if (Math.abs(wheelBufferRef.current) < wheelThreshold) {
        return;
      }

      const direction: 1 | -1 = wheelBufferRef.current > 0 ? 1 : -1;
      moveStep(direction);
    },
    [clearIdleTimer, disabled, idleResetMs, moveStep, stepCount, wheelThreshold],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (disabled || isSceneInteractiveTarget(event.target)) {
        return;
      }

      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        moveStep(1);
      }

      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        moveStep(-1);
      }
    },
    [disabled, moveStep],
  );

  const handleTouchStart = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      if (disabled || isSceneInteractiveTarget(event.target)) {
        touchStartYRef.current = null;
        return;
      }

      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    },
    [disabled],
  );

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      if (disabled || touchStartYRef.current == null) {
        return;
      }

      const endY = event.changedTouches[0]?.clientY ?? touchStartYRef.current;
      const delta = touchStartYRef.current - endY;
      touchStartYRef.current = null;

      if (Math.abs(delta) < touchThreshold) {
        return;
      }

      moveStep(delta > 0 ? 1 : -1);
    },
    [disabled, moveStep, touchThreshold],
  );

  const sceneBindings = useMemo(
    () => ({
      onWheelCapture: handleWheelCapture,
      onKeyDown: handleKeyDown,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      tabIndex: 0,
    }),
    [handleKeyDown, handleTouchEnd, handleTouchStart, handleWheelCapture],
  );

  return {
    activeIndex,
    isFirst: activeIndex === 0,
    isLast: activeIndex === Math.max(stepCount - 1, 0),
    goToStep,
    resetToStep,
    goNext: () => moveStep(1),
    goPrev: () => moveStep(-1),
    sceneBindings,
  };
}
