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
        className="shell pt-2.5"
        style={{
          paddingLeft: "max(var(--shell-gutter), var(--safe-left))",
          paddingRight: "max(var(--shell-gutter), var(--safe-right))",
          paddingBottom: "calc(var(--safe-bottom) + 0.5rem)",
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
      <div className="shell flex justify-end pb-[var(--admin-entry-offset)]">
        <TransitionLink
          href="/admin"
          className="archive-chip pointer-events-auto rounded-full px-3 py-1.25 text-[0.62rem] uppercase tracking-[0.18em] text-[var(--text-secondary)] opacity-80 shadow-[0_14px_30px_rgba(150,166,186,0.14)] transition-opacity duration-200 hover:opacity-100 sm:px-3.5 sm:py-1.5 sm:text-[0.66rem]"
        >
          {globalContent.adminEntryLabel}
        </TransitionLink>
      </div>
    </div>
  );
}
