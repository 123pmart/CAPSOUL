export type SiteTheme = "light" | "dark";

export const SITE_THEME_STORAGE_KEY = "capsoul-theme";
export const DEFAULT_SITE_THEME: SiteTheme = "dark";

export function getThemeInitializationScript() {
  return `
    (function () {
      try {
        var storedTheme = window.localStorage.getItem("${SITE_THEME_STORAGE_KEY}");
        var theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : "${DEFAULT_SITE_THEME}";
        var root = document.documentElement;
        root.dataset.theme = theme;
        root.style.colorScheme = theme;
      } catch (error) {
        var fallbackRoot = document.documentElement;
        fallbackRoot.dataset.theme = "${DEFAULT_SITE_THEME}";
        fallbackRoot.style.colorScheme = "${DEFAULT_SITE_THEME}";
      }
    })();
  `;
}
