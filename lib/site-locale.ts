import { cookies } from "next/headers";

import { type SiteLocale } from "@/lib/site-content-schema";

export const SITE_LOCALE_COOKIE = "capsoul-locale";
export const DEFAULT_SITE_LOCALE: SiteLocale = "en";

export function normalizeSiteLocale(value: unknown): SiteLocale {
  return value === "es" ? "es" : "en";
}

export async function getRequestSiteLocale(): Promise<SiteLocale> {
  const cookieStore = await cookies();
  return normalizeSiteLocale(cookieStore.get(SITE_LOCALE_COOKIE)?.value);
}
