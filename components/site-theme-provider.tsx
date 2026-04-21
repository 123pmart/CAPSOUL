"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_SITE_THEME,
  SITE_THEME_STORAGE_KEY,
  type SiteTheme,
} from "@/lib/site-theme";

type SiteThemeContextValue = {
  theme: SiteTheme;
  setTheme: (theme: SiteTheme) => void;
  toggleTheme: () => void;
};

const SiteThemeContext = createContext<SiteThemeContextValue | null>(null);

function readCurrentTheme(): SiteTheme {
  if (typeof document === "undefined") {
    return DEFAULT_SITE_THEME;
  }

  const currentTheme = document.documentElement.dataset.theme;

  return currentTheme === "light" || currentTheme === "dark" ? currentTheme : DEFAULT_SITE_THEME;
}

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<SiteTheme>(readCurrentTheme);

  useEffect(() => {
    const nextTheme = readCurrentTheme();
    setThemeState((currentTheme) => (currentTheme === nextTheme ? currentTheme : nextTheme));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    try {
      window.localStorage.setItem(SITE_THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore persistence failures and keep the in-memory theme.
    }
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== SITE_THEME_STORAGE_KEY) {
        return;
      }

      const nextTheme = event.newValue === "light" || event.newValue === "dark" ? event.newValue : DEFAULT_SITE_THEME;
      setThemeState(nextTheme);
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const value = useMemo<SiteThemeContextValue>(
    () => ({
      theme,
      setTheme: (nextTheme) => {
        setThemeState(nextTheme);
      },
      toggleTheme: () => {
        setThemeState((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
      },
    }),
    [theme],
  );

  return <SiteThemeContext.Provider value={value}>{children}</SiteThemeContext.Provider>;
}

export function useSiteTheme() {
  const context = useContext(SiteThemeContext);

  if (!context) {
    throw new Error("useSiteTheme must be used inside SiteThemeProvider.");
  }

  return context;
}
