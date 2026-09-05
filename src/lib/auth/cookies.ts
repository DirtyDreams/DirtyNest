import { cookies } from "next/headers";
import { ACCESS_COOKIE, REFRESH_COOKIE, ACCESS_TTL, REFRESH_TTL } from "./jwt";

const secure = process.env.NODE_ENV === "production";

export async function setAuthCookies(access: string, refresh: string): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, access, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: ACCESS_TTL,
  });
  store.set(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: REFRESH_TTL,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, "", { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 0 });
  store.set(REFRESH_COOKIE, "", { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 0 });
}
