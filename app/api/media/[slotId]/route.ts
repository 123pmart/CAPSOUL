import { getMediaSlotBlob } from "@/lib/media";

const MEDIA_CACHE_CONTROL = "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400";

function getConditionalHeaders(request: Request) {
  const headers: Record<string, string> = {};
  const ifNoneMatch = request.headers.get("if-none-match");
  const ifModifiedSince = request.headers.get("if-modified-since");

  if (ifNoneMatch) {
    headers["if-none-match"] = ifNoneMatch;
  }

  if (ifModifiedSince) {
    headers["if-modified-since"] = ifModifiedSince;
  }

  return headers;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slotId: string }> },
) {
  const { slotId } = await context.params;
  const blob = await getMediaSlotBlob(slotId, getConditionalHeaders(request));

  if (!blob) {
    return new Response("Media not found.", { status: 404 });
  }

  if (blob.statusCode === 304) {
    return new Response(null, { status: 304 });
  }

  const headers = new Headers();
  headers.set("Cache-Control", MEDIA_CACHE_CONTROL);
  headers.set("Content-Type", blob.blob.contentType || "application/octet-stream");
  headers.set("Content-Length", String(blob.blob.size));
  headers.set("ETag", blob.blob.etag);

  return new Response(blob.stream, {
    status: 200,
    headers,
  });
}
