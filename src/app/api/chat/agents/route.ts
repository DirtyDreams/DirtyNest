import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, initDb } from "@/lib/db";
import { agentConfigs } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth/currentUser";

const updateAgentSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  system_prompt: z.string().max(20000).optional(),
  keywords: z.array(z.string()).max(100).optional(),
  tool_whitelist: z.array(z.string()).max(100).optional(),
  llm_provider: z.string().trim().max(50).optional(),
  llm_model: z.string().trim().max(100).optional(),
  enabled: z.boolean().optional(),
});

export async function GET() {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(agentConfigs).orderBy(agentConfigs.id);
  const agents = rows.map((r) => ({
    id: r.id,
    agent_type: r.agent_type,
    name: r.name,
    description: r.description,
    system_prompt: r.system_prompt,
    keywords: safeParseArray(r.keywords),
    tool_whitelist: safeParseArray(r.tool_whitelist),
    llm_provider: r.llm_provider,
    llm_model: r.llm_model,
    enabled: r.enabled === 1,
  }));
  return NextResponse.json({ agents });
}

export async function PUT(req: NextRequest) {
  await initDb();
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const agentType = typeof body.agent_type === "string" ? body.agent_type : null;
  if (!agentType) {
    return NextResponse.json({ error: "agent_type is required" }, { status: 400 });
  }

  const parsed = updateAgentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(agentConfigs)
    .where(eq(agentConfigs.agent_type, agentType))
    .limit(1);
  if (existing.length === 0) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.description !== undefined) patch.description = parsed.data.description;
  if (parsed.data.system_prompt !== undefined) patch.system_prompt = parsed.data.system_prompt;
  if (parsed.data.keywords !== undefined) patch.keywords = JSON.stringify(parsed.data.keywords);
  if (parsed.data.tool_whitelist !== undefined) patch.tool_whitelist = JSON.stringify(parsed.data.tool_whitelist);
  if (parsed.data.llm_provider !== undefined) patch.llm_provider = parsed.data.llm_provider;
  if (parsed.data.llm_model !== undefined) patch.llm_model = parsed.data.llm_model;
  if (parsed.data.enabled !== undefined) patch.enabled = parsed.data.enabled ? 1 : 0;

  const res = await db
    .update(agentConfigs)
    .set(patch)
    .where(eq(agentConfigs.agent_type, agentType))
    .returning();

  return NextResponse.json({ agent: res[0] });
}

function safeParseArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
