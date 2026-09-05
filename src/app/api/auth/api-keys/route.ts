import { db, initDb } from "@/db";
import * as schema from "@/lib/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyToken, ACCESS_COOKIE } from "@/lib/auth/jwt";
import { encryptJson } from "@/lib/auth/encryption";

export async function PUT(request: Request) {
  await initDb();
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const keys = body?.api_keys;
  if (!keys || typeof keys !== "object" || Array.isArray(keys)) {
    return Response.json({ error: "api_keys object required" }, { status: 400 });
  }

  const encrypted = await encryptJson(keys);
  await db
    .update(schema.users)
    .set({ api_keys: encrypted })
    .where(eq(schema.users.id, Number(payload.sub)));

  return Response.json({ ok: true });
}
