"use client";

import { usePathname } from "next/navigation";

import { TransitionLink } from "@/components/transition-link";

export function AdminEntry() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 sm:justify-end sm:px-4">
      <TransitionLink
        href="/admin"
        className="archive-chip pointer-events-auto rounded-full px-3.5 py-1.5 text-[0.66rem] uppercase tracking-[0.18em] text-[var(--text-secondary)]"
      >
        Admin
      </TransitionLink>
    </div>
  );
}
