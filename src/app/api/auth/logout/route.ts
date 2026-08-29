import { clearAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
  await clearAuthCookies();
  return Response.json({ ok: true });
}
