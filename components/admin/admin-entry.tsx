"use client";

import { usePathname } from "next/navigation";

import { TransitionLink } from "@/components/transition-link";

export function AdminEntry() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-end px-3 sm:px-4"
      style={{
        bottom: "var(--admin-entry-offset)",
        paddingLeft: "max(0.75rem, var(--safe-left))",
        paddingRight: "max(0.75rem, var(--safe-right))",
      }}
    >
      <TransitionLink
        href="/admin"
        className="archive-chip pointer-events-auto rounded-full px-3.5 py-1.5 text-[0.66rem] uppercase tracking-[0.18em] text-[var(--text-secondary)] shadow-[0_14px_30px_rgba(150,166,186,0.14)]"
      >
        Admin
      </TransitionLink>
    </div>
  );
}
