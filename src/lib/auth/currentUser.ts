import { cookies } from "next/headers";
import { verifyToken, ACCESS_COOKIE } from "./jwt";

/**
 * Resolve the authenticated user id from the httpOnly access cookie.
 * Returns null when unauthenticated. Routes are already protected by the
 * middleware, so this is a belt-and-suspenders re-verification that also
 * yields the user id for ownership scoping.
 */
export async function getCurrentUserId(): Promise<number | null> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  const id = Number(payload.sub);
  return Number.isFinite(id) ? id : null;
}
