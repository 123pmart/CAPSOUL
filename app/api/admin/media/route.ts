import { NextResponse } from "next/server";

import {
  getCurrentAdminFromSessionToken,
  getSessionTokenFromCookieHeader,
} from "@/lib/admin-auth";
import {
  listResolvedMediaSlots,
  removeMediaSlotAssignment,
  saveMediaSlotObjectPosition,
  saveMediaSlotUpload,
} from "@/lib/media";

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

  return NextResponse.json({ ok: true, media: await listResolvedMediaSlots() });
}

export async function POST(request: Request) {
  const admin = await getAuthorizedAdmin(request);

  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const slotId = String(formData.get("slotId") ?? "");
    const objectPosition = String(formData.get("objectPosition") ?? "");
    const file = formData.get("file");

    if (!slotId) {
      return NextResponse.json({ ok: false, error: "A media slot is required." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "An image file is required." }, { status: 400 });
    }

    const mimeType = file.type || "";
    const isImage =
      mimeType.startsWith("image/") ||
      file.name.toLowerCase().endsWith(".svg");

    if (!isImage) {
      return NextResponse.json({ ok: false, error: "Only image uploads are supported." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const updatedSlot = await saveMediaSlotUpload({
      slotId,
      fileBuffer: buffer,
      fileName: file.name,
      mimeType,
      updatedBy: admin.username,
      objectPosition,
    });

    return NextResponse.json({ ok: true, slot: updatedSlot });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save media.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const admin = await getAuthorizedAdmin(request);

  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { slotId?: string; objectPosition?: string };
    const slotId = String(body.slotId ?? "");
    const objectPosition = String(body.objectPosition ?? "");

    if (!slotId) {
      return NextResponse.json({ ok: false, error: "A media slot is required." }, { status: 400 });
    }

    const updatedSlot = await saveMediaSlotObjectPosition({
      slotId,
      objectPosition,
      updatedBy: admin.username,
    });

    return NextResponse.json({ ok: true, slot: updatedSlot });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update framing.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const admin = await getAuthorizedAdmin(request);

  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { slotId?: string };
    const slotId = String(body.slotId ?? "");

    if (!slotId) {
      return NextResponse.json({ ok: false, error: "A media slot is required." }, { status: 400 });
    }

    const updatedSlot = await removeMediaSlotAssignment(slotId);
    return NextResponse.json({ ok: true, slot: updatedSlot });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to remove media.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
