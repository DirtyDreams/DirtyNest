"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Cloud,
  AlertTriangle,
  Trash2,
  Check,
  Server,
  Zap,
} from "lucide-react";
import NumberFlow from "@number-flow/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cyberAudio } from "@/lib/cyberAudio";

export default function AwsCloudBurnWidget() {
  const [budget] = useState(3000);
  const [spent, setSpent] = useState(2180);
  const [projected] = useState(2790);
  const [idleInstances, setIdleInstances] = useState([
    { id: "i-09f8a", name: "dev-worker-us-east-1", cost: "$48/mo", type: "t3.xlarge" },
    { id: "vol-38b", name: "unattached-ebs-gp3", cost: "$24/mo", type: "120GB EBS" },
  ]);
  const [terminated, setTerminated] = useState(false);

  const burnPct = Math.round((spent / budget) * 100);

  const handleTerminateIdle = () => {
    cyberAudio.play("warp");
    setSpent((prev) => Math.max(0, prev - 72));
    setIdleInstances([]);
    setTerminated(true);
    setTimeout(() => setTerminated(false), 3000);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 bg-[#080912] border border-white/10 rounded-2xl flex flex-col gap-4 font-mono select-none shadow-lg hover:border-[#00F0FF]/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FFB800]/10 border border-[#FFB800]/30 flex items-center justify-center text-[#FFB800]">
            <DollarSign size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              FINOPS CLOUD SPEND & BURN
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              AWS & GCP Autonomous Cost Telemetry
            </span>
          </div>
        </div>

        <Badge variant="outline" className="flex items-center gap-1.5 px-2 py-0.5 bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/30 text-[10px] font-bold">
          <span><NumberFlow value={burnPct} />% OF BUDGET</span>
        </Badge>
      </div>

      {/* Burn Rate Metrics Strip */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col">
          <span className="text-[9px] text-[#4F536E] uppercase">Current Spend</span>
          <span className="text-sm font-black text-[#F1F3F9] mt-0.5">
            $<NumberFlow value={spent} />
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col">
          <span className="text-[9px] text-[#4F536E] uppercase">Forecast EOM</span>
          <span className="text-sm font-black text-[#00F0FF] mt-0.5">
            $<NumberFlow value={projected} />
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col">
          <span className="text-[9px] text-[#4F536E] uppercase">Max Budget</span>
          <span className="text-sm font-black text-[#9499B3] mt-0.5">
            $<NumberFlow value={budget} />
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#00FF41] via-[#FFB800] to-red-500"
            style={{ width: `${burnPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-[#4F536E]">
          <span>$0 (1st of month)</span>
          <span>Target: &lt;${budget}</span>
        </div>
      </div>

      {/* Idle Resources Alert & Remediation */}
      {idleInstances.length > 0 ? (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <AlertTriangle size={13} />
              <span>{idleInstances.length} Idle Resources Detected ($72/mo waste)</span>
            </div>
          </div>

          <div className="space-y-1 text-[10px] text-[#9499B3]">
            {idleInstances.map((ins) => (
              <div key={ins.id} className="flex justify-between font-mono">
                <span>{ins.name} ({ins.type})</span>
                <span className="text-amber-300 font-bold">{ins.cost}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={handleTerminateIdle}
            variant="destructive"
            size="sm"
            className="w-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs h-8 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 size={12} />
            <span>TERMINATE IDLE RESOURCES</span>
          </Button>
        </div>
      ) : (
        <div className="p-2 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-center text-xs text-[#00FF41] flex items-center justify-center gap-1.5">
          <Check size={14} />
          <span>Zero idle resource waste. Infrastructure optimized!</span>
        </div>
      )}
    </div>
  );
}
