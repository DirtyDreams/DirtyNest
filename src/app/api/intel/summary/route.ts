import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { fetchThreatRadarSummary } from "@/lib/intel/sidecar";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const summary = await fetchThreatRadarSummary();
  if (!summary) {
    return NextResponse.json({
      posture: "UNKNOWN",
      kev_total_weaponized: 0,
      kev_ransomware_linked: 0,
      recent_cve_count: 0,
      critical_cve_count: 0,
      high_cve_count: 0,
      mesh_total_services: 0,
      mesh_healthy_services: 0,
      mesh_ports: [],
      top_threats: [],
      timestamp: Date.now() / 1000,
    });
  }

  return NextResponse.json(summary);
}
