import { SignJWT, jwtVerify } from "jose";

// JWT signing secret. MUST be set in .env.local for production; dev fallback
// is insecure and only for local development.
const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-jwt-secret-change-me";
const secret = new TextEncoder().encode(JWT_SECRET);

export const ACCESS_COOKIE = "dirtynest_access";
export const REFRESH_COOKIE = "dirtynest_refresh";

export const ACCESS_TTL = 15 * 60; // 15 minutes (seconds)
export const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days (seconds)

export interface AuthPayload {
  sub: string; // user id
  username: string;
  role: string;
}

export async function signAccessToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ username: payload.username, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL}s`)
    .sign(secret);
}

export async function signRefreshToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ username: payload.username, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL}s`)
    .sign(secret);
}
// Short-lived token for WebSocket handshakes (exposed to browser JS, so keep
// the TTL minimal). Verified by the sidecar with the same JWT_SECRET.
export async function signWsToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ username: payload.username, role: payload.role, scope: "ws" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      username: (payload.username as string) || "",
      role: (payload.role as string) || "operator",
    };
  } catch {
    return null;
  }
}
