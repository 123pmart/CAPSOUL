export type SiteTheme = "light" | "dark";

export const SITE_THEME_STORAGE_KEY = "capsoul-theme";
export const SITE_THEME_COOKIE_NAME = "capsoul-theme";
export const DEFAULT_SITE_THEME: SiteTheme = "dark";
export const SITE_THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isSiteTheme(value: unknown): value is SiteTheme {
  return value === "light" || value === "dark";
}
