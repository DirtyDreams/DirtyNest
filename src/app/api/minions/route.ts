import { NextRequest, NextResponse } from "next/server";
import { fetchMinions, dispatchMinionTask } from "@/lib/minions/sidecar";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchMinions();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { minionId, name, directive, duration } = body;
    if (!minionId || !name || !directive) {
      return NextResponse.json(
        { error: "Missing required fields: minionId, name, directive" },
        { status: 400 }
      );
    }
    const data = await dispatchMinionTask(minionId, { name, directive, duration });
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
