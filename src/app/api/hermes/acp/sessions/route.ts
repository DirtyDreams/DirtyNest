import { db } from "@/lib/db";
import { hermesSessions, hermesMessages } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const sessions = await db
      .select()
      .from(hermesSessions)
      .orderBy(desc(hermesSessions.updated_at));
    return Response.json({ status: "success", sessions });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("Error fetching ACP sessions:", error);
    return Response.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name = `Hermes-ACP-Session-${Date.now().toString().slice(-4)}`,
      profile = "dirtydaily",
      model = "Nous-Hermes-3-Llama-3.1-8B",
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

    return Response.json({ status: "success", session: newSession[0] }, { status: 201 });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("Error creating ACP session:", error);
    return Response.json({ error: error?.message || "Invalid payload" }, { status: 400 });
  }
}
