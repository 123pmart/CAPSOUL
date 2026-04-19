import { NextResponse } from "next/server";

import {
  getCurrentAdminFromSessionToken,
  getSessionTokenFromCookieHeader,
  updateAdminProfile,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const currentAdmin = await getCurrentAdminFromSessionToken(
    getSessionTokenFromCookieHeader(request.headers.get("cookie")) ??
      request.headers.get("x-admin-session"),
  );

  if (!currentAdmin) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      username?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const updatedAdmin = await updateAdminProfile(currentAdmin.id, {
      username: body.username,
      currentPassword: body.currentPassword ?? "",
      newPassword: body.newPassword,
    });

    return NextResponse.json({ ok: true, user: updatedAdmin });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update settings.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
