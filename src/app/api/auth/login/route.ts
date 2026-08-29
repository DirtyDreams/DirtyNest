import { db, initDb, insertAuditLog } from "@/db";
import * as schema from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();
    const { username, password } = body || {};
    if (!username || !password) {
      return Response.json({ error: "Username and password are required" }, { status: 400 });
    }

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, String(username).trim()));

    if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const payload = { sub: String(user.id), username: user.username, role: user.role };
    const access = await signAccessToken(payload);
    const refresh = await signRefreshToken(payload);
    await setAuthCookies(access, refresh);

    await insertAuditLog("AUDIT", "AUTH", "login", user.username, { user_id: user.id }, user.id);

    return Response.json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    return Response.json({ error: "Invalid JSON or internal error" }, { status: 400 });
  }
}
