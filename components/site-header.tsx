"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { heroRevealTransition, measuredEase } from "@/components/motion-config";
import { TransitionLink } from "@/components/transition-link";
import { navigation } from "@/content/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="shell pt-3">
        <motion.div
          initial={reduceMotion ? false : { y: -14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: reduceMotion ? 0 : heroRevealTransition.duration,
            ease: reduceMotion ? measuredEase : heroRevealTransition.ease,
          }}
          className="scene-shell scene-shell-cool px-4 py-3 backdrop-blur-xl"
        >
          <div className="relative z-10 flex min-h-[3.5rem] items-center justify-between gap-4 lg:grid lg:grid-cols-[minmax(14rem,1fr)_auto_minmax(14rem,1fr)] lg:items-center lg:gap-6">
            <div className="flex min-w-0 items-center lg:w-full lg:justify-self-start">
              <TransitionLink href="/" aria-label="Go to CAPSOUL home page" className="shrink-0">
                <BrandMark compact />
              </TransitionLink>
            </div>

            <nav
              aria-label="Primary navigation"
              className="hidden items-center justify-self-center gap-1 rounded-full border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(242,247,252,0.88))] px-1.5 py-1.5 shadow-[0_18px_42px_rgba(152,169,189,0.18)] backdrop-blur-xl lg:inline-flex"
            >
              {navigation.map((item) => {
                const active =
                  item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

                return (
                  <TransitionLink
                    key={item.href}
                    href={item.href}
                    className={`nav-pill rounded-full px-3.5 py-2 text-[0.84rem] font-medium tracking-[-0.012em] ${
                      active
                        ? "border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(228,237,246,0.98))] text-[var(--text-primary)] shadow-[0_14px_28px_rgba(154,170,190,0.2)]"
                        : "text-[var(--text-secondary)] hover:bg-white/58 hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {item.label}
                  </TransitionLink>
                );
              })}
            </nav>

            <div className="hidden min-w-0 items-center justify-end gap-3 lg:flex lg:w-full lg:justify-self-end">
              <span className="archive-chip rounded-full px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                Private by design
              </span>
              <TransitionLink className="button-primary px-4 py-2 text-[0.88rem]" href="/inquire">
                Inquire Now
              </TransitionLink>
            </div>

            <button
              type="button"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(241,246,251,0.9))] text-[var(--text-primary)] shadow-[0_14px_28px_rgba(154,170,190,0.16)] backdrop-blur-lg lg:hidden"
              onClick={() => setIsOpen((value) => !value)}
            >
              <span className="relative block h-4 w-5">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ease-out ${
                    isOpen ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-opacity duration-150 ease-out ${
                    isOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ease-out ${
                    isOpen ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>

          <div
            id="mobile-navigation"
            className={`overflow-hidden transition-[max-height,padding] duration-300 ease-out lg:hidden ${
              isOpen ? "max-h-[420px] pt-4" : "max-h-0"
            }`}
          >
            <div className="grid gap-2.5">
              {navigation.map((item) => {
                const active =
                  item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

                return (
                  <TransitionLink
                    key={item.href}
                    href={item.href}
                    className={`nav-pill rounded-[1rem] px-4 py-3 text-[0.94rem] ${
                      active
                        ? "border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(228,237,246,0.98))] text-[var(--text-primary)] shadow-[0_12px_24px_rgba(154,170,190,0.16)]"
                        : "bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(242,247,252,0.88))] text-[var(--text-primary)]"
                    }`}
                  >
                    {item.label}
                  </TransitionLink>
                );
              })}

              <TransitionLink className="button-primary" href="/inquire">
                Inquire Now
              </TransitionLink>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
