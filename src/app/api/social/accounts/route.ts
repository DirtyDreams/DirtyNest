import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, initDb, insertLog } from "@/lib/db";
import { socialAccounts } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { encryptJson } from "@/lib/auth/encryption";

const connectSchema = z.object({
  platform: z.enum(["twitter", "instagram", "facebook", "tiktok", "reddit"]),
  account_name: z.string().trim().min(1).max(255),
  access_token: z.string().trim().min(1),
  refresh_token: z.string().trim().optional(),
  expires_at: z.string().optional(),
});

export async function GET(req: NextRequest) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.user_id, userId))
    .orderBy(desc(socialAccounts.created_at));

  // Never leak tokens back to the client.
  return NextResponse.json({
    accounts: accounts.map((a) => ({
      id: a.id,
      platform: a.platform,
      account_name: a.account_name,
      is_active: a.is_active,
      created_at: a.created_at,
      updated_at: a.updated_at,
    })),
  });
}

export async function POST(req: NextRequest) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = connectSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { platform, account_name, access_token, refresh_token, expires_at } = parsed.data;
  const now = new Date().toISOString();

  // Encrypt tokens at rest (AES-256-GCM).
  const encToken = await encryptJson({ access_token, refresh_token: refresh_token ?? null });

  const res = await db
    .insert(socialAccounts)
    .values({
      user_id: userId,
      platform,
      account_name,
      access_token: encToken,
      refresh_token: refresh_token ? await encryptJson(refresh_token) : null,
      expires_at: expires_at ?? null,
      is_active: 1,
      created_at: now,
      updated_at: now,
    })
    .returning();

  const account = res[0];
  try {
    await insertLog("SUCCESS", "UI", "SOCIAL_ACCOUNT_CONNECTED", "User-Operator", {
      accountId: account.id,
      platform,
      account_name,
    });
  } catch {}

  return NextResponse.json(
    {
      account: {
        id: account.id,
        platform: account.platform,
        account_name: account.account_name,
        is_active: account.is_active,
        created_at: account.created_at,
        updated_at: account.updated_at,
      },
    },
    { status: 201 },
  );
}
