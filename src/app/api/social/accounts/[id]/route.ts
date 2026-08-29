import { NextRequest, NextResponse } from "next/server";
import { db, initDb, insertLog } from "@/lib/db";
import { socialAccounts } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const accountId = Number(id);
  if (!Number.isFinite(accountId)) {
    return NextResponse.json({ error: "Invalid account id" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(socialAccounts)
    .where(and(eq(socialAccounts.id, accountId), eq(socialAccounts.user_id, userId)));

  if (!existing[0]) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  await db.delete(socialAccounts).where(eq(socialAccounts.id, accountId));

  try {
    await insertLog("SUCCESS", "UI", "SOCIAL_ACCOUNT_DELETED", "User-Operator", {
      accountId,
      platform: existing[0].platform,
    });
  } catch {}

  return NextResponse.json({ ok: true });
}
