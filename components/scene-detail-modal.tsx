"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
    : { duration: 0.28, ease: premiumEase };

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <div key="scene-detail-modal" className="scene-detail-modal md:hidden">
          <motion.div
            aria-hidden="true"
            className="scene-detail-backdrop"
            onClick={onClose}
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="scene-detail-panel"
            initial={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 0, y: 10 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 8 }
            }
            transition={panelTransition}
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
      ) : null}
    </AnimatePresence>
  );
}
