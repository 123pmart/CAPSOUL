import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  AdminAuthConfigurationError,
  assertAdminLoginConfiguration,
  authenticateAdmin,
  createAdminSessionToken,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const username = body.username?.trim() ?? "";
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "Enter both username and password." },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    assertAdminLoginConfiguration();
    const admin = await authenticateAdmin(username, password);

    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "Incorrect username or password." },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const response = NextResponse.json(
      { ok: true, user: admin },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );

    // Keep the cookie host-only so the same implementation works cleanly on
    // Vercel production, previews, and local development without domain drift.
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(admin.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ADMIN_SESSION_MAX_AGE,
      expires: new Date(Date.now() + ADMIN_SESSION_MAX_AGE * 1000),
      path: "/",
      priority: "high",
    });

    return response;
  } catch (error) {
    if (error instanceof AdminAuthConfigurationError) {
      console.error("[admin/login] auth configuration error:", error.message);
      return NextResponse.json(
        { ok: false, error: "Admin login is temporarily unavailable." },
        {
          status: 503,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    console.error("[admin/login] unexpected error:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to log in right now." },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
