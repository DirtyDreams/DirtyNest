import { db, initDb } from "@/db";
import * as schema from "@/lib/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import {
  verifyToken,
  signAccessToken,
  signRefreshToken,
  REFRESH_COOKIE,
} from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";

// Refresh-token rotation: a valid refresh cookie issues a fresh access token
// and a new refresh token (old one is superseded by the new cookie).
export async function POST() {
  await initDb();
  const store = await cookies();
  const refresh = store.get(REFRESH_COOKIE)?.value;
  if (!refresh) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await verifyToken(refresh);
  if (!payload) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, Number(payload.sub)));
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const newPayload = { sub: String(user.id), username: user.username, role: user.role };
  const access = await signAccessToken(newPayload);
  const newRefresh = await signRefreshToken(newPayload);
  await setAuthCookies(access, newRefresh);

  return Response.json({ ok: true });
}
