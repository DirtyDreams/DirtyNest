import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hermesMemories } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Delete from PostgreSQL
    await db.delete(hermesMemories).where(eq(hermesMemories.id, id));

    // 2. Delete from Qdrant via Sidecar
    try {
      const sidecarUrl = process.env.NEXT_PUBLIC_SIDECAR_URL || "http://localhost:8000";
      await fetch(`${sidecarUrl}/api/hermes/memories/${id}`, {
        method: "DELETE",
      });
    } catch (qdrantErr) {
      console.warn("Failed to delete memory from Qdrant sidecar:", qdrantErr);
    }

    return NextResponse.json({ status: "success", deleted_id: id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete memory";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
