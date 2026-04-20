"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { measuredEase, premiumEase } from "@/components/motion-config";

type SceneDetailModalProps = {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function SceneDetailModal({
  open,
  onClose,
  eyebrow,
  title,
  description,
  children,
}: SceneDetailModalProps) {
  const reduceMotion = useReducedMotion();
  const [shouldRender, setShouldRender] = useState(open);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  const backdropTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: measuredEase };
  const panelTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: premiumEase };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      aria-hidden={!open}
      className="scene-detail-modal md:hidden"
      style={{
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <motion.button
        type="button"
        aria-label="Close scene detail"
        className="scene-detail-backdrop"
        onClick={onClose}
        initial={false}
        animate={open ? { opacity: 1 } : { opacity: 0 }}
        transition={backdropTransition}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="scene-detail-panel panel-strong"
        initial={false}
        animate={
          open
            ? { opacity: 1, scale: 1, y: 0 }
            : reduceMotion
              ? { opacity: 0, scale: 1, y: 0 }
              : { opacity: 0, scale: 0.982, y: 10 }
        }
        transition={panelTransition}
        onAnimationComplete={() => {
          if (!open) {
            setShouldRender(false);
          }
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-2 text-[1.3rem] leading-[1.02] text-[var(--text-primary)] sm:text-[1.55rem]">
              {title}
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close detail"
            className="scene-detail-close"
            onClick={onClose}
          >
            X
          </button>
        </div>

        <div className="scene-detail-scroll">
          {description ? (
            <p className="text-[0.92rem] leading-6 text-[var(--text-secondary)] sm:text-[0.96rem] sm:leading-7">
              {description}
            </p>
          ) : null}

          {children ? <div className="grid gap-2.5">{children}</div> : null}
        </div>
      </motion.div>
    </div>
  );
}
