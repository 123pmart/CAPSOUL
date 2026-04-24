import type { ReactNode } from "react";
import type { Metadata } from "next";
import Script from "next/script";

import { AdminEntry } from "@/components/admin/admin-entry";
import { SceneTransitionProvider } from "@/components/scene-transition-provider";
import { SiteLocaleProvider } from "@/components/site-locale-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteThemeProvider } from "@/components/site-theme-provider";
import { company } from "@/content/site";
import { getRequestSiteLocale } from "@/lib/site-locale";
import { getSiteContent } from "@/lib/site-content";
import { getThemeInitializationScript } from "@/lib/site-theme";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getRequestSiteLocale();
  const siteContent = await getSiteContent(locale);

  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <head>
        <Script
          id="capsoul-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: getThemeInitializationScript() }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <div className="relative isolate min-h-[100svh] overflow-x-clip">
          <SiteThemeProvider>
            <SiteLocaleProvider locale={locale} globalContent={siteContent.global}>
              <SceneTransitionProvider>
                <SiteHeader />
                <main
                  id="main-content"
                  className="relative min-h-[100svh] w-full max-w-full overflow-x-clip pt-[var(--header-offset-mobile)] sm:pt-[var(--header-offset-desktop)]"
                >
                  {children}
                  <div className="md:hidden">
                    <AdminEntry inline />
                  </div>
                </main>
              </SceneTransitionProvider>
            </SiteLocaleProvider>
          </SiteThemeProvider>
        </div>
      </body>
    </html>
  );
}
