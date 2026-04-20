import type { ReactNode } from "react";
import type { Metadata } from "next";

import { AdminEntry } from "@/components/admin/admin-entry";
import { SceneTransitionProvider } from "@/components/scene-transition-provider";
import { SiteHeader } from "@/components/site-header";
import { company } from "@/content/site";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${company.name} | ${company.descriptor}`,
    template: `%s | ${company.name}`,
  },
  description:
    "CAPSOUL creates premium legacy documentaries that preserve voice, presence, family history, wisdom, and love with cinematic care.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <div className="relative isolate min-h-[100svh] overflow-x-clip">
          <SceneTransitionProvider>
            <SiteHeader />
            <main
              id="main-content"
              className="relative min-h-[100svh] w-full max-w-full pb-[var(--admin-entry-clearance)] pt-[var(--header-offset-mobile)] sm:pt-[var(--header-offset-desktop)] lg:pb-0"
            >
              {children}
            </main>
            <AdminEntry />
          </SceneTransitionProvider>
        </div>
      </body>
    </html>
  );
}
