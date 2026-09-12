import { db } from "@/lib/db";
import { hermesSessions, hermesMessages } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";

export const HERMES_PROFILES = [
  { id: "default", name: "Default Gateway", model: "glm-5.3-flash", desc: "Fast general tactical reasoning & tool calling" },
  { id: "dirtyimage", name: "Dirty Image Generator", model: "deepseek-v4-flash", desc: "Creative neural diffusion & prompt matrix dispatch" },
  { id: "agents", name: "Autonomous Swarm", model: "deepseek-v4-flash", desc: "Multi-agent coding, subagent delegation & audits" },
];

export async function GET() {
  try {
    const sessions = await db
      .select()
      .from(hermesSessions)
      .orderBy(desc(hermesSessions.updated_at));
    return Response.json({ status: "success", sessions, profiles: HERMES_PROFILES });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("Error fetching ACP sessions:", error);
    return Response.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reqProfile = body?.profile || "default";
    const defaultModelForProfile = reqProfile === "dirtyimage" || reqProfile === "agents" ? "deepseek-v4-flash" : "glm-5.3-flash";
    const {
      name = `Hermes-ACP-Session-${Date.now().toString().slice(-4)}`,
      profile = reqProfile,
      model = body?.model || defaultModelForProfile,
      cwd = process.cwd(),
    } = body || {};

    const sessionId = `acp-ses-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const nowIso = new Date().toISOString();

    await db.insert(hermesSessions).values({
      id: sessionId,
      name: name.trim(),
      profile: profile.trim(),
      model: model.trim(),
      cwd: cwd.trim(),
      status: "IDLE",
      created_at: nowIso,
      updated_at: nowIso,
    });

    // Add initial system message
    await db.insert(hermesMessages).values({
      id: `msg-sys-${Date.now()}`,
      session_id: sessionId,
      role: "system",
      content: `[ACP SESSION INITIALIZED] Hermes Profile: ${profile} | Model: ${model} | CWD: ${cwd}`,
      created_at: nowIso,
    });

    const newSession = await db
      .select()
      .from(hermesSessions)
      .where(eq(hermesSessions.id, sessionId))
      .limit(1);

    return Response.json({ status: "success", session: newSession[0], profiles: HERMES_PROFILES }, { status: 201 });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("Error creating ACP session:", error);
    return Response.json({ error: error?.message || "Invalid payload" }, { status: 400 });
  }
}
