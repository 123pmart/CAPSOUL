"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import type { GlobalSiteContent, SiteLocale } from "@/lib/site-content-schema";

type SiteLocaleContextValue = {
  locale: SiteLocale;
  globalContent: GlobalSiteContent;
  isUpdatingLocale: boolean;
  setLocale: (locale: SiteLocale) => Promise<void>;
};

const SiteLocaleContext = createContext<SiteLocaleContextValue | null>(null);

export function SiteLocaleProvider({
  locale,
  globalContent,
  children,
}: {
  locale: SiteLocale;
  globalContent: GlobalSiteContent;
  children: ReactNode;
}) {
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState<SiteLocale>(locale);
  const [isUpdatingLocale, setIsUpdatingLocale] = useState(false);

  useEffect(() => {
    setCurrentLocale(locale);
  }, [locale]);

  const value = useMemo<SiteLocaleContextValue>(
    () => ({
      locale: currentLocale,
      globalContent,
      isUpdatingLocale,
      setLocale: async (nextLocale) => {
        if (nextLocale === currentLocale) {
          return;
        }

        setCurrentLocale(nextLocale);
        setIsUpdatingLocale(true);

        try {
          await fetch("/api/site-locale", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ locale: nextLocale }),
          });
        } finally {
          router.refresh();
          setIsUpdatingLocale(false);
        }
      },
    }),
    [currentLocale, globalContent, isUpdatingLocale, router],
  );

  return <SiteLocaleContext.Provider value={value}>{children}</SiteLocaleContext.Provider>;
}

export function useSiteLocale() {
  const context = useContext(SiteLocaleContext);

  if (!context) {
    throw new Error("useSiteLocale must be used inside SiteLocaleProvider.");
  }

  return context;
}
