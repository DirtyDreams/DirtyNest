import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, ACCESS_COOKIE } from "@/lib/auth/jwt";

// ---------------------------------------------------------------------------
// In-memory rate limiter (per-IP, fixed window). Applied to /api/auth/* and
// /api/chat/*. Per-instance only — acceptable for single-node homelab.
// ---------------------------------------------------------------------------
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 60; // requests per window per IP
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_MAX;
}

// Opportunistic cleanup so the map never grows unbounded.
function sweepRateBuckets(): void {
  const now = Date.now();
  for (const [ip, bucket] of rateBuckets) {
    if (bucket.resetAt < now) rateBuckets.delete(ip);
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate-limit auth + chat endpoints.
  if (pathname.startsWith("/api/auth/") || pathname.startsWith("/api/chat/")) {
    sweepRateBuckets();
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (rateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  // /api/auth/* is public at the middleware layer; login/logout/refresh need no
  // token, and me/api-keys verify the token themselves (they need the user row).
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Protect every other /api/* route.
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.next();
  response.headers.set("x-user-id", payload.sub);
  response.headers.set("x-user-role", payload.role);
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
