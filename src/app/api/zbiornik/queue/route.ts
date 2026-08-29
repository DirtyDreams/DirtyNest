import { db } from "@/lib/db";
import { zbQueue } from "@/lib/schema";
import { contentHash, logActivity } from "@/lib/zbiornik/ops";
import { and, desc, eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

const KINDS = ["topic", "comment", "priv"] as const;
const ACTIVE_STATUSES = ["draft", "approved", "failed"] as const;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const kind = url.searchParams.get("kind");
    const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 200);

    const conds = [];
    if (status && status !== "all") conds.push(eq(zbQueue.status, status));
    if (kind) conds.push(eq(zbQueue.kind, kind));

    const items = await db
      .select()
      .from(zbQueue)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(zbQueue.id))
      .limit(limit);

    return Response.json({ items });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return Response.json({ error: error?.message || "queue list failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      kind?: string;
      target_ref?: string;
      title?: string;
      body?: string;
      portal_ref?: string;
    };
    const kind = String(body.kind ?? "").trim();
    const targetRef = String(body.target_ref ?? "").trim();
    const title = String(body.title ?? "").trim();
    const bodyText = String(body.body ?? "").trim();

    if (!KINDS.includes(kind as (typeof KINDS)[number])) {
      return Response.json({ error: `kind must be one of ${KINDS.join("|")}` }, { status: 400 });
    }
    if (kind === "topic" && (!targetRef || !title)) {
      return Response.json({ error: "topic draft wymaga kategorii/target_ref i tytułu" }, { status: 400 });
    }
    if (kind !== "topic" && (!targetRef || !bodyText)) {
      return Response.json({ error: `${kind} wymaga target_ref i treści` }, { status: 400 });
    }

    const hash = await contentHash(`${kind}|${targetRef}|${title}||${bodyText}`);

    const dup = await db
      .select({ id: zbQueue.id, status: zbQueue.status })
      .from(zbQueue)
      .where(and(eq(zbQueue.content_hash, hash), inArray(zbQueue.status, [...ACTIVE_STATUSES])))
      .limit(1);
    if (dup.length) {
      return Response.json({ ok: true, id: dup[0].id, duplicate: true });
    }

    const [created] = await db
      .insert(zbQueue)
      .values({
        kind,
        target_ref: targetRef.slice(0, 290) || null,
        content_hash: hash,
        title: title || null,
        body: bodyText,
        status: "draft",
        portal_ref: (String(body.portal_ref ?? "").trim() || null),
        created_at: new Date().toISOString(),
      })
      .returning({ id: zbQueue.id });

    await logActivity({ op: `queue:${kind}`, targetRef: targetRef, ok: true, message: `Draft #${created.id} created` });
    return Response.json({ ok: true, id: created.id, duplicate: false }, { status: 201 });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return Response.json({ error: error?.message || "queue create failed" }, { status: 500 });
  }
}