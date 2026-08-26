"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Sparkles,
  Sliders,
  DollarSign,
  Image as ImageIcon,
  Clock,
  RotateCcw,
  Zap,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

export default function NexusSettingsTab() {
  const toast = useToast();
  const [simulationSpeed, setSimulationSpeed] = useState("1x");
  const [revenueMultiplier, setRevenueMultiplier] = useState("1.0");
  const [imageEngine, setImageEngine] = useState("imagen3");
  const [autoPostCadence, setAutoPostCadence] = useState("3h");
  const [fanHypeRate, setFanHypeRate] = useState("medium");
  const [sponsorThreshold, setSponsorThreshold] = useState("5000");

  useEffect(() => {
    try {
      const savedSpeed = localStorage.getItem("dirtynest_nexus_speed");
      if (savedSpeed) setSimulationSpeed(savedSpeed);
      const savedRev = localStorage.getItem("dirtynest_nexus_revenue_mul");
      if (savedRev) setRevenueMultiplier(savedRev);
      const savedEngine = localStorage.getItem("dirtynest_nexus_img_engine");
      if (savedEngine) setImageEngine(savedEngine);
      const savedCadence = localStorage.getItem("dirtynest_nexus_cadence");
      if (savedCadence) setAutoPostCadence(savedCadence);
      const savedHype = localStorage.getItem("dirtynest_nexus_hype");
      if (savedHype) setFanHypeRate(savedHype);
    } catch {}
  }, []);

  const handleSave = () => {
    cyberAudio.play("chime");
    try {
      localStorage.setItem("dirtynest_nexus_speed", simulationSpeed);
      localStorage.setItem("dirtynest_nexus_revenue_mul", revenueMultiplier);
      localStorage.setItem("dirtynest_nexus_img_engine", imageEngine);
      localStorage.setItem("dirtynest_nexus_cadence", autoPostCadence);
      localStorage.setItem("dirtynest_nexus_hype", fanHypeRate);
    } catch {}
    toast.success("Nexus Engine Saved", "Agency simulation hyperparameters applied.");
  };

  const handleResetSimulation = () => {
    cyberAudio.play("alarm");
    toast.info("Simulation Reset", "Nexus state reset to agency baseline.");
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none animate-fade-in">
      <div className="border-b border-white/5 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#FF007F] uppercase tracking-wider flex items-center gap-2">
            <Users size={16} />
            <span>Persona Nexus & Influencer Agency Studio</span>
          </h3>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Configure virtual influencer simulation speed, revenue multipliers, image generation & sponsor rates
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF007F] text-black font-black text-xs hover:bg-[#e00070] transition-all cursor-pointer shadow-[0_0_12px_rgba(255,0,127,0.3)]"
        >
          <Sparkles size={13} />
          <span>SAVE NEXUS PARAMETERS</span>
        </button>
      </div>

      {/* Simulation Speed & Multipliers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Speed */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <Clock size={13} className="text-[#FF007F]" />
            <span>Simulation Clock Speed</span>
          </label>
          <select
            value={simulationSpeed}
            onChange={(e) => setSimulationSpeed(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#FF007F] outline-none font-bold"
          >
            <option value="1x">1x (Real-time Live Cadence)</option>
            <option value="2x">2x (Accelerated Campaign)</option>
            <option value="5x">5x (Hyper-Simulation)</option>
            <option value="10x">10x (Instant Quarter Stress Test)</option>
          </select>
          <span className="text-[9px] text-[#4F536E]">Affects follower and revenue velocity</span>
        </div>

        {/* Revenue Multiplier */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <DollarSign size={13} className="text-[#00FF41]" />
            <span>Virtual Revenue Multiplier</span>
          </label>
          <select
            value={revenueMultiplier}
            onChange={(e) => setRevenueMultiplier(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00FF41] outline-none font-bold"
          >
            <option value="0.5">0.5x (Conservative Ad Market)</option>
            <option value="1.0">1.0x (Standard Market Value)</option>
            <option value="2.0">2.0x (High Engagement Tier)</option>
            <option value="5.0">5.0x (Viral Super-Star Multiplier)</option>
          </select>
          <span className="text-[9px] text-[#4F536E]">Brand deals and livestream tips</span>
        </div>

        {/* Image Synthesis Engine */}
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <ImageIcon size={13} className="text-[#00F0FF]" />
            <span>AI Avatar Synthesis Engine</span>
          </label>
          <select
            value={imageEngine}
            onChange={(e) => setImageEngine(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#00F0FF] outline-none font-bold"
          >
            <option value="imagen3">Google Imagen 3 Pro (Photorealistic)</option>
            <option value="sdxl">Stable Diffusion XL (High Style)</option>
            <option value="flux">Flux.1 Pro (Ultra-Resolution)</option>
            <option value="mock">Synthetic Cyber Mesh (Fast Mock)</option>
          </select>
          <span className="text-[9px] text-[#4F536E]">Generates 4K avatar photo feeds</span>
        </div>
      </div>

      {/* Auto-Post and Fan Hype */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <TrendingUp size={13} className="text-[#00FF41]" />
            <span>Autonomous Post Publishing Cadence</span>
          </label>
          <select
            value={autoPostCadence}
            onChange={(e) => setAutoPostCadence(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#F1F3F9] outline-none font-bold"
          >
            <option value="1h">Every 1 Hour (High Frequency)</option>
            <option value="3h">Every 3 Hours (Recommended)</option>
            <option value="6h">Every 6 Hours (Balanced)</option>
            <option value="12h">Every 12 Hours (Curated Daily)</option>
          </select>
        </div>

        <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <label className="text-xs text-[#F1F3F9] uppercase font-bold flex items-center gap-2">
            <MessageSquare size={13} className="text-[#BF40FF]" />
            <span>Livestream Fan Comment Density</span>
          </label>
          <select
            value={fanHypeRate}
            onChange={(e) => setFanHypeRate(e.target.value)}
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-[#BF40FF] outline-none font-bold"
          >
            <option value="low">Low (1-2 msgs/sec)</option>
            <option value="medium">Medium (5-10 msgs/sec)</option>
            <option value="high">High Velocity Hype (20+ msgs/sec)</option>
          </select>
        </div>
      </div>

      {/* Reset Simulation */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/[0.04] border border-red-500/20">
        <div>
          <div className="font-bold text-xs text-red-400 uppercase">Reset Agency Roster & Campaign Memory</div>
          <p className="text-[11px] text-[#4F536E] mt-0.5">
            Clears cached influencer simulation metrics and restarts follower milestones
          </p>
        </div>
        <button
          onClick={handleResetSimulation}
          className="px-3.5 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold hover:bg-red-500/30 transition-all cursor-pointer"
        >
          RESET ROSTER
        </button>
      </div>
    </div>
  );
}
