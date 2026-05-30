import type { ReactNode } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { AdminEntry } from "@/components/admin/admin-entry";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SceneTransitionProvider } from "@/components/scene-transition-provider";
import { SiteLocaleProvider } from "@/components/site-locale-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteThemeProvider } from "@/components/site-theme-provider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { PublicVisualScope } from "@/components/public-visual-scope";
import { company } from "@/content/site";
import { getRequestSiteLocale } from "@/lib/site-locale";
import { getSiteContent } from "@/lib/site-content";
import {
  DEFAULT_SITE_THEME,
  SITE_THEME_COOKIE_NAME,
  isSiteTheme,
} from "@/lib/site-theme";

import "./globals.css";
import "./liquid-glass.css";

const siteThemeInitScript = `
(() => {
  const fallbackTheme = "light";
  const storageKey = "capsoul-theme";
  const cookieName = "capsoul-theme";
  const isTheme = (value) => value === "light" || value === "dark";

  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    const cookieTheme = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(cookieName + "="))
      ?.split("=")[1];
    const theme = isTheme(storedTheme)
      ? storedTheme
      : isTheme(cookieTheme)
        ? cookieTheme
        : fallbackTheme;

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.dataset.theme = document.documentElement.dataset.theme || fallbackTheme;
    document.documentElement.style.colorScheme = document.documentElement.dataset.theme;
  }
})();
`;

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
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(SITE_THEME_COOKIE_NAME)?.value;
  const initialTheme = isSiteTheme(cookieTheme) ? cookieTheme : DEFAULT_SITE_THEME;

  return (
    <html lang={locale} data-theme={initialTheme} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: siteThemeInitScript }} />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <div className="relative isolate min-h-[100svh]">
          <SiteThemeProvider initialTheme={initialTheme}>
            <SiteLocaleProvider locale={locale} globalContent={siteContent.global}>
              <SmoothScroll>
                <ScrollProgress />
                <PublicVisualScope>
                  <SceneTransitionProvider>
                    <SiteHeader />
                    <main
                      id="main-content"
                      className="relative min-h-[100svh] w-full max-w-full pt-[var(--header-offset-mobile)] sm:pt-[var(--header-offset-desktop)]"
                    >
                      {children}
                      <div className="md:hidden">
                        <AdminEntry inline />
                      </div>
                    </main>
                  </SceneTransitionProvider>
                </PublicVisualScope>
              </SmoothScroll>
            </SiteLocaleProvider>
          </SiteThemeProvider>
        </div>
      </body>
    </html>
  );
}
