import { sidecarPost } from "@/lib/zbiornik/ops";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let port = 9333;
    try {
      const body = await request.json();
      if (body?.port) port = Number(body.port);
    } catch {}

    const res = await sidecarPost("/api/automations/zbiornik/chrome/launch", { port }, 15_000);
    if (!res.ok) {
      return Response.json(
        { ok: false, error: res.error || "Nie udało się uruchomić sesji Chrome" },
        { status: res.status || 502 }
      );
    }
    return Response.json(res.data ?? { ok: true, port });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return Response.json({ ok: false, error: error?.message || "Błąd uruchamiania Chrome" }, { status: 500 });
  }
}
