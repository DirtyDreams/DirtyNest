import { publishQueueItem } from "@/lib/zbiornik/ops";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { queueId?: number };
    const queueId = Number(body.queueId);
    if (!Number.isInteger(queueId)) {
      return Response.json({ error: "queueId required" }, { status: 400 });
    }
    const result = await publishQueueItem(queueId);
    return Response.json(result, { status: result.ok ? 200 : 409 });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return Response.json({ error: error?.message || "publish failed" }, { status: 500 });
  }
}