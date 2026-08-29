import { db, initDb } from "@/db";
import * as schema from "@/lib/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyToken, signWsToken, ACCESS_COOKIE } from "@/lib/auth/jwt";

// Returns a short-lived JWT for WebSocket handshakes. The access cookie is
// httpOnly (invisible to JS), so the frontend fetches a dedicated WS token
// here and passes it as ?token= to the sidecar.
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

  const wsToken = await signWsToken({ sub: String(user.id), username: user.username, role: user.role });
  return Response.json({ token: wsToken });
}
