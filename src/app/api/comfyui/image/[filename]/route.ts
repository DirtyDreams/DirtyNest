import { NextRequest, NextResponse } from "next/server";

const SIDECAR_URL = process.env.NEXT_PUBLIC_SIDECAR_URL || "http://localhost:8000";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const { searchParams } = new URL(request.url);
    const subfolder = searchParams.get("subfolder") || "";
    const type = searchParams.get("type") || "output";

    const targetUrl = `${SIDECAR_URL}/api/comfy/image/${encodeURIComponent(filename)}?subfolder=${encodeURIComponent(subfolder)}&type=${encodeURIComponent(type)}`;

    const res = await fetch(targetUrl, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return new NextResponse("Image not found", { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/png";
    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(message, { status: 500 });
  }
}
