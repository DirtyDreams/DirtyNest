import { db } from "@/db";
import { zbQueue } from "@/lib/schema";
import { contentHash, logActivity } from "@/lib/zbiornik/ops";
import { and, eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["draft", "approved", "failed"] as const;

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: idRaw } = await ctx.params;
    const id = Number(idRaw);
    if (!Number.isInteger(id)) return Response.json({ error: "invalid id" }, { status: 400 });

    const body = (await request.json()) as {
      action?: "approve" | "reject" | "edit";
      title?: string;
      body?: string;
      target_ref?: string;
    };
    const action = body.action;

    const [item] = await db.select().from(zbQueue).where(eq(zbQueue.id, id)).limit(1);
    if (!item) return Response.json({ error: `not found: ${id}` }, { status: 404 });

    const now = new Date().toISOString();

    if (action === "approve") {
      if (!["draft", "failed"].includes(item.status)) {
        return Response.json({ error: `approve not allowed from status ${item.status}` }, { status: 409 });
      }
      await db
        .update(zbQueue)
        .set({ status: "approved", approved_at: now, error: null })
        .where(eq(zbQueue.id, id));
      await logActivity({ op: `approve:${item.kind}`, targetRef: item.target_ref, payload: { queueId: id }, ok: true, message: `#${id} approved — gotowe do publikacji` });
      return Response.json({ ok: true });
    }

    if (action === "reject") {
      if (item.status === "published") {
        return Response.json({ error: "nie można odrzucić opublikowanego elementu" }, { status: 409 });
      }
      await db.update(zbQueue).set({ status: "rejected" }).where(eq(zbQueue.id, id));
      await logActivity({ op: `reject:${item.kind}`, targetRef: item.target_ref, payload: { queueId: id }, ok: true, message: `#${id} rejected` });
      return Response.json({ ok: true });
    }

    if (action === "edit") {
      if (item.status !== "draft") {
        return Response.json({ error: "edycja tylko dla statusu draft" }, { status: 409 });
      }
      const title = body.title !== undefined ? String(body.title).trim() : (item.title ?? "");
      const bodyText = body.body !== undefined ? String(body.body).trim() : item.body;
      const targetRef = body.target_ref !== undefined ? String(body.target_ref).trim() : (item.target_ref ?? "");

      if (item.kind === "topic" && (!targetRef || !title)) {
        return Response.json({ error: "topic wymaga kategorii i tytułu" }, { status: 400 });
      }
      if (item.kind !== "topic" && (!targetRef || !bodyText)) {
        return Response.json({ error: "wymagane target_ref i treść" }, { status: 400 });
      }

      // Re-dedup against live drafts with the new content.
      const hash = await contentHash(`${item.kind}|${targetRef}|${title}||${bodyText}`);
      const dup = await db
        .select({ id: zbQueue.id })
        .from(zbQueue)
        .where(and(eq(zbQueue.content_hash, hash), inArray(zbQueue.status, [...ACTIVE_STATUSES])))
        .limit(1);
      if (dup.length && dup[0].id !== id) {
        return Response.json({ error: `duplikat istnieje jako #${dup[0].id}` }, { status: 409 });
      }

      await db
        .update(zbQueue)
        .set({ title: title || null, body: bodyText, target_ref: targetRef.slice(0, 290) || null, content_hash: hash })
        .where(eq(zbQueue.id, id));
      await logActivity({ op: `edit:${item.kind}`, targetRef, payload: { queueId: id }, ok: true, message: `#${id} edited` });
      return Response.json({ ok: true });
    }

    return Response.json({ error: "action must be approve|reject|edit" }, { status: 400 });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return Response.json({ error: error?.message || "queue patch failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: idRaw } = await ctx.params;
    const id = Number(idRaw);
    if (!Number.isInteger(id)) return Response.json({ error: "invalid id" }, { status: 400 });

    const [item] = await db.select().from(zbQueue).where(eq(zbQueue.id, id)).limit(1);
    if (!item) return Response.json({ error: `not found: ${id}` }, { status: 404 });
    if (item.status === "published") {
      return Response.json({ error: "nie można usunąć opublikowanego (historia)" }, { status: 409 });
    }
    await db.delete(zbQueue).where(eq(zbQueue.id, id));
    await logActivity({ op: `delete:${item.kind}`, targetRef: item.target_ref, payload: { queueId: id }, ok: true, message: `#${id} deleted` });
    return Response.json({ ok: true });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return Response.json({ error: error?.message || "queue delete failed" }, { status: 500 });
  }
}