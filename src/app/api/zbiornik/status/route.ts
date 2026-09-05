import { getRules, queueCounts, sidecarGet, publishedToday } from "@/lib/zbiornik/ops";
import {  } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [sidecar, counts, rules, usedToday] = await Promise.all([
      sidecarGet("/api/automations/zbiornik/status", 15_000),
      queueCounts(),
      getRules(),
      publishedToday(),
    ]);

    const data = (sidecar.data ?? {}) as Record<string, unknown>;
    const session = (data.session ?? {}) as Record<string, unknown>;
    const last = sidecar.ok ? ((data.lastPoll ?? null) as Record<string, unknown> | null) : null;

    const lastPoll: { at: string | null; topics: number; inbox: number; notif: number } | null = last
      ? {
          at: (last.at as string) ?? null,
          topics: Number(((last.counts as Record<string, unknown> | undefined) ?? {}).topics ?? 0),
          inbox: Number(((last.counts as Record<string, unknown> | undefined) ?? {}).inbox ?? 0),
          notif: Number(((last.counts as Record<string, unknown> | undefined) ?? {}).notif ?? 0),
        }
      : null;

    const loginCodeRaw = String(session.loginCode ?? "").toUpperCase();
    const loginCode = (["OK", "LOGIN_REQUIRED", "CDP_OFFLINE", "NOT_CONFIGURED"].includes(loginCodeRaw)
      ? loginCodeRaw
      : "NOT_CONFIGURED") as "OK" | "LOGIN_REQUIRED" | "CDP_OFFLINE" | "NOT_CONFIGURED";

    // Live unread counters from the portal session (runner `me`): raw.data.counters
    const raw = (session.raw ?? {}) as Record<string, unknown>;
    const rawMe = (raw.data ?? {}) as Record<string, unknown>;
    const counters = (rawMe.counters ?? null) as Record<string, number> | null;

    return Response.json({
      session: {
        connected: Boolean(session.connected),
        port: (session.port as number) ?? null,
        loggedIn: (session.loggedIn as boolean) ?? null,
        loginCode,
        account: (session.account as string) ?? null,
        unread: counters
          ? {
              messages: Number(counters.unreadMessages ?? 0),
              notifications: Number(counters.unseenNotifications ?? 0),
            }
          : null,
      },
      lastPoll,
      queue: counts,
      rules,
      usedToday,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return Response.json({ error: error?.message || "status failed" }, { status: 500 });
  }
}