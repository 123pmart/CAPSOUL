import { NextResponse } from "next/server";

import { DEFAULT_SITE_LOCALE, SITE_LOCALE_COOKIE, normalizeSiteLocale } from "@/lib/site-locale";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { locale?: unknown };
  const locale = normalizeSiteLocale(body.locale);
  const response = NextResponse.json({ ok: true, locale });

  response.cookies.set({
    name: SITE_LOCALE_COOKIE,
    value: locale,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true, locale: DEFAULT_SITE_LOCALE });

  response.cookies.set({
    name: SITE_LOCALE_COOKIE,
    value: DEFAULT_SITE_LOCALE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });

  return response;
}
