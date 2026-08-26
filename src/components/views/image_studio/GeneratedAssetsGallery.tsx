"use client";

import { useState } from "react";
import { Sparkles, Download, Copy, Check, Eye, Tag, Calendar } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface AssetItem {
  id: string;
  title: string;
  url: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  seed: number;
  steps: number;
  created: string;
}

export const SAMPLE_ASSETS: AssetItem[] = [
  {
    id: "img-01",
    title: "Sentinel Drone Patrolling Neo-Warsaw",
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
    prompt: "Autonomous surveillance drone hovering over rainy neon metropolis streets, volumetric lights, reflections",
    style: "Cyberpunk 2077",
    aspectRatio: "16:9",
    seed: 4892112,
    steps: 35,
    created: "2026-08-26 22:15",
  },
  {
    id: "img-02",
    title: "Tactical Operative Night Infiltration",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
    prompt: "Cyber operative with holographic tactical visor in an abandoned server farm, dark mood, green lasers",
    style: "Dark Military",
    aspectRatio: "16:9",
    seed: 9012441,
    steps: 28,
    created: "2026-08-26 21:40",
  },
  {
    id: "img-03",
    title: "Virtual Idol Hologram 'KIRA' Live",
    url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80",
    prompt: "Anime VTuber virtual idol singing on a holographic arena stage, particle laser beams, chromatic aberration",
    style: "Anime Mecha",
    aspectRatio: "1:1",
    seed: 1420853,
    steps: 32,
    created: "2026-08-26 20:30",
  },
  {
    id: "img-04",
    title: "Quantum Mainframe Liquid Cooling Hub",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    prompt: "Supercomputer server room with glowing green liquid coolant tubes, obsidian racks, mist fog",
    style: "Cyberpunk 2077",
    aspectRatio: "16:9",
    seed: 6632910,
    steps: 30,
    created: "2026-08-26 19:12",
  },
  {
    id: "img-05",
    title: "Synthwave Highway Sunset 1984",
    url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80",
    prompt: "Retro sports car driving into glowing wireframe neon sun on outrun highway, magenta chrome sky",
    style: "Outrun Synthwave",
    aspectRatio: "16:9",
    seed: 3391024,
    steps: 30,
    created: "2026-08-26 18:05",
  },
  {
    id: "img-06",
    title: "Combat Mecha Armor Unit-08",
    url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80",
    prompt: "Heavy assault combat mecha standing in hangar repair bay, warning decals, hydraulic pistons",
    style: "Anime Mecha",
    aspectRatio: "1:1",
    seed: 7781920,
    steps: 34,
    created: "2026-08-26 16:50",
  },
];

interface Props {
  onSelectAsset: (asset: AssetItem) => void;
  selectedAssetId?: string;
}

export default function GeneratedAssetsGallery({
  onSelectAsset,
  selectedAssetId,
}: Props) {
  const [filter, setFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ["ALL", "Cyberpunk 2077", "Anime Mecha", "Dark Military", "Outrun Synthwave"];

  const filtered = SAMPLE_ASSETS.filter(
    (item) => filter === "ALL" || item.style === filter
  );

  const handleCopyPrompt = (e: React.MouseEvent, id: string, prompt: string) => {
    e.stopPropagation();
    cyberAudio.play("click");
    navigator.clipboard?.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
            GENERATED ASSETS VAULT // <span className="text-[#00FF41]">NEURAL REPO</span>
          </h3>
          <p className="text-[10px] text-[#4F536E]">
            Recent diffusion artifacts with prompt seeds & sampling metadata
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                cyberAudio.play("click");
                setFilter(cat);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                filter === cat
                  ? "bg-[#00FF41] text-black"
                  : "bg-white/5 text-[#9499B3] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Artwork Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((item) => {
          const isSelected = selectedAssetId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => {
                cyberAudio.play("click");
                onSelectAsset(item);
              }}
              className={`group relative rounded-xl bg-black/60 border overflow-hidden transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url(${item.url})` }}
                />
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/80 text-[#00FF41] border border-[#00FF41]/40 uppercase">
                    {item.style}
                  </span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/80 text-[#00F0FF] border border-white/10">
                    {item.aspectRatio}
                  </span>
                </div>
              </div>

              {/* Card Meta Footer */}
              <div className="p-3 space-y-1.5">
                <h4 className="text-xs font-bold text-[#F1F3F9] truncate group-hover:text-[#00FF41] transition-colors">
                  {item.title}
                </h4>

                <p className="text-[10px] text-[#9499B3] line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>

                <div className="flex items-center justify-between text-[9px] text-[#4F536E] pt-2 border-t border-white/5">
                  <span>Seed: {item.seed}</span>
                  <button
                    type="button"
                    onClick={(e) => handleCopyPrompt(e, item.id, item.prompt)}
                    className="text-[#00F0FF] hover:underline flex items-center gap-0.5"
                    title="Copy Prompt"
                  >
                    {copiedId === item.id ? <Check size={10} className="text-[#00FF41]" /> : <Copy size={10} />}
                    <span>{copiedId === item.id ? "COPIED" : "PROMPT"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
