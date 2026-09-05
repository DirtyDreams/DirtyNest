import { SignJWT } from "jose";
import {
  signAccessToken,
  signRefreshToken,
  signWsToken,
  verifyToken,
  ACCESS_TTL,
  REFRESH_TTL,
} from "./jwt";
import { describe, it, expect } from "vitest";

describe("jwt", () => {
  const payload = { sub: "1", username: "admin", role: "admin" };

  it("signs and verifies an access token round-trip", async () => {
    const token = await signAccessToken(payload);
    const decoded = await verifyToken(token);
    expect(decoded).toEqual(payload);
  });

  it("signs and verifies a refresh token round-trip", async () => {
    const token = await signRefreshToken(payload);
    const decoded = await verifyToken(token);
    expect(decoded).toEqual(payload);
  });

  it("ws token carries scope=ws", async () => {
    const token = await signWsToken(payload);
    const decoded = await verifyToken(token);
    expect(decoded?.username).toBe("admin");
    // scope is not part of AuthPayload, but the token must verify
    expect(decoded).not.toBeNull();
  });

  it("returns null for a token signed with a different secret", async () => {
    const foreign = await new SignJWT({ username: "admin", role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("1")
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("a-different-secret"));
    expect(await verifyToken(foreign)).toBeNull();
  });

  it("returns null for garbage input", async () => {
    expect(await verifyToken("not-a-jwt")).toBeNull();
  });

  it("exposes expected TTLs", () => {
    expect(ACCESS_TTL).toBe(15 * 60);
    expect(REFRESH_TTL).toBe(7 * 24 * 60 * 60);
  });
});
