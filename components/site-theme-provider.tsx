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
  SITE_THEME_COOKIE_MAX_AGE,
  SITE_THEME_COOKIE_NAME,
  SITE_THEME_STORAGE_KEY,
  isSiteTheme,
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

  return isSiteTheme(currentTheme) ? currentTheme : DEFAULT_SITE_THEME;
}

function applySiteTheme(theme: SiteTheme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  try {
    window.localStorage.setItem(SITE_THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore persistence failures and keep the in-memory theme.
  }

  try {
    document.cookie = `${SITE_THEME_COOKIE_NAME}=${theme}; path=/; max-age=${SITE_THEME_COOKIE_MAX_AGE}; samesite=lax`;
  } catch {
    // Cookie persistence is a reload convenience, not required for live theme state.
  }
}

export function SiteThemeProvider({
  children,
  initialTheme = DEFAULT_SITE_THEME,
}: {
  children: ReactNode;
  initialTheme?: SiteTheme;
}) {
  const [theme, setThemeState] = useState<SiteTheme>(initialTheme);

  useEffect(() => {
    const nextTheme = readCurrentTheme();
    setThemeState((currentTheme) => (currentTheme === nextTheme ? currentTheme : nextTheme));
  }, []);

  useEffect(() => {
    applySiteTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== SITE_THEME_STORAGE_KEY) {
        return;
      }

      const nextTheme = isSiteTheme(event.newValue) ? event.newValue : DEFAULT_SITE_THEME;
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
        applySiteTheme(nextTheme);
        setThemeState(nextTheme);
      },
      toggleTheme: () => {
        setThemeState((currentTheme) => {
          const nextTheme = currentTheme === "dark" ? "light" : "dark";
          applySiteTheme(nextTheme);
          return nextTheme;
        });
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
