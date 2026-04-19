import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  authenticateAdmin,
  createAdminSessionToken,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const admin = await authenticateAdmin(body.username ?? "", body.password ?? "");

    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "Incorrect username or password." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ ok: true, user: admin });
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(admin.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ADMIN_SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to log in right now." },
      { status: 500 },
    );
  }
}
