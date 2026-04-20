"use client";

import { usePathname } from "next/navigation";

import { useSiteLocale } from "@/components/site-locale-provider";
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
        className="shell pt-3"
        style={{
          paddingLeft: "max(var(--shell-gutter), var(--safe-left))",
          paddingRight: "max(var(--shell-gutter), var(--safe-right))",
          paddingBottom: "calc(var(--safe-bottom) + 0.75rem)",
        }}
      >
        <div className="flex justify-end">
          <TransitionLink
            href="/admin"
            className="archive-chip rounded-full px-3 py-1.25 text-[0.62rem] uppercase tracking-[0.18em] text-[var(--text-secondary)] shadow-[0_14px_30px_rgba(150,166,186,0.14)]"
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
      <div className="shell flex justify-start pb-[var(--admin-entry-offset)]">
        <TransitionLink
          href="/admin"
          className="archive-chip pointer-events-auto rounded-full px-3 py-1.25 text-[0.62rem] uppercase tracking-[0.18em] text-[var(--text-secondary)] shadow-[0_14px_30px_rgba(150,166,186,0.14)] sm:px-3.5 sm:py-1.5 sm:text-[0.66rem]"
        >
          {globalContent.adminEntryLabel}
        </TransitionLink>
      </div>
    </div>
  );
}
