"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { contentSwapTransition } from "@/components/motion-config";

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

  const overlayMotion = reduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
  const panelMotion = reduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 18, scale: 0.985 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 10, scale: 0.992 },
      };

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          {...overlayMotion}
          transition={contentSwapTransition}
          className="scene-detail-modal md:hidden"
        >
          <button
            type="button"
            aria-label="Close scene detail"
            className="scene-detail-backdrop"
            onClick={onClose}
          />

          <motion.div
            {...panelMotion}
            transition={contentSwapTransition}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="scene-detail-panel panel-strong"
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
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
