import { NextResponse } from "next/server";

import {
  getCurrentAdminFromSessionToken,
  getSessionTokenFromCookieHeader,
} from "@/lib/admin-auth";
import { getSiteContentDocument, saveSiteContentDocument } from "@/lib/site-content";

async function getAuthorizedAdmin(request: Request) {
  return getCurrentAdminFromSessionToken(
    getSessionTokenFromCookieHeader(request.headers.get("cookie")),
  );
}

export async function GET(request: Request) {
  const admin = await getAuthorizedAdmin(request);

  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({ ok: true, content: await getSiteContentDocument() });
}

export async function POST(request: Request) {
  const admin = await getAuthorizedAdmin(request);

  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { content?: unknown };
    const content = await saveSiteContentDocument(body.content);
    return NextResponse.json({ ok: true, content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save site content.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
