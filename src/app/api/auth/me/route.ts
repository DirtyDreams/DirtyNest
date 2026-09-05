import { db, initDb } from "@/db";
import * as schema from "@/lib/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyToken, ACCESS_COOKIE } from "@/lib/auth/jwt";
import { decryptJson } from "@/lib/auth/encryption";

export async function GET() {
  await initDb();
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, Number(payload.sub)));
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const apiKeys = user.api_keys ? await decryptJson<Record<string, string>>(user.api_keys) : {};
  return Response.json({
    id: user.id,
    username: user.username,
    role: user.role,
    api_keys: apiKeys || {},
  });
}
