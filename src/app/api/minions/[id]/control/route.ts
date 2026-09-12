import { NextRequest, NextResponse } from "next/server";
import { controlMinionNode } from "@/lib/minions/sidecar";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const action = body.action as "pause" | "resume" | "restart";

    if (!action || !["pause", "resume", "restart"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Allowed: pause, resume, restart" },
        { status: 400 }
      );
    }

    const data = await controlMinionNode(id, action);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
