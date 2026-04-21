"use client";

import { usePathname } from "next/navigation";

import { useSiteLocale } from "@/components/site-locale-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { TransitionLink } from "@/components/transition-link";

export function AdminEntry({ inline = false }: { inline?: boolean }) {
  const pathname = usePathname();
  const { globalContent } = useSiteLocale();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  if (inline) {
    return (
      <div
        className="shell pt-2.5"
        style={{
          paddingLeft: "max(var(--shell-gutter), var(--safe-left))",
          paddingRight: "max(var(--shell-gutter), var(--safe-right))",
          paddingBottom: "calc(var(--safe-bottom) + 0.5rem)",
        }}
      >
        <div className="flex items-center justify-center gap-2.5">
          <ThemeToggle />
          <TransitionLink
            href="/admin"
            className="archive-chip rounded-full px-3 py-1.25 text-[0.62rem] uppercase tracking-[0.18em] text-[var(--text-secondary)]"
          >
            {globalContent.adminEntryLabel}
          </TransitionLink>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden md:block"
      style={{
        paddingLeft: "var(--safe-left)",
        paddingRight: "var(--safe-right)",
      }}
    >
      <div className="shell flex items-center justify-center gap-2.5 pb-[var(--admin-entry-offset)]">
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
        <TransitionLink
          href="/admin"
          className="archive-chip pointer-events-auto rounded-full px-3 py-1.25 text-[0.62rem] uppercase tracking-[0.18em] text-[var(--text-secondary)] opacity-70 transition-opacity duration-200 hover:opacity-100 sm:px-3.5 sm:py-1.5 sm:text-[0.66rem]"
        >
          {globalContent.adminEntryLabel}
        </TransitionLink>
      </div>
    </div>
  );
}
