"use client";

import { useState, useEffect } from "react";
import { Sparkles, Download, Copy, Check, FolderPlus, Folder, Star, Search, Wand2, Paintbrush, X } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface AlbumItem {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface AssetItem {
  id: string;
  title: string;
  url: string;
  prompt: string;
  negativePrompt?: string;
  style: string;
  aspectRatio: string;
  seed: number;
  steps: number;
  cfgScale?: number;
  model?: string;
  sampler?: string;
  albumId?: string;
  isFavorite?: boolean;
  created: string;
}

export const INITIAL_ALBUMS: AlbumItem[] = [
  { id: "all", name: "All Vault Artifacts", color: "#00FF41" },
  { id: "favorites", name: "Starred Favorites", color: "#FFB800" },
  { id: "cyberpunk", name: "Cyberpunk Metropolis", color: "#00F0FF" },
  { id: "operatives", name: "Tactical Operatives", color: "#BF40FF" },
  { id: "mecha", name: "Mecha & Robotics", color: "#FF0055" },
  { id: "synthwave", name: "Retro Synthwave", color: "#3B82F6" },
];

export const SAMPLE_ASSETS: AssetItem[] = [
  {
    id: "img-01",
    title: "Sentinel Drone Patrolling Neo-Warsaw",
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
    prompt: "Autonomous surveillance drone hovering over rainy neon metropolis streets, volumetric lights, reflections",
    negativePrompt: "blurry, low quality, deformed, artifacts, text watermark",
    style: "Cyberpunk 2077",
    aspectRatio: "16:9",
    model: "SDXL 1.0 Turbo",
    sampler: "DPM++ 2M Karras",
    cfgScale: 7.5,
    seed: 4892112,
    steps: 35,
    albumId: "cyberpunk",
    isFavorite: true,
    created: "2026-08-26 22:15",
  },
  {
    id: "img-02",
    title: "Tactical Operative Night Infiltration",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
    prompt: "Cyber operative with holographic tactical visor in an abandoned server farm, dark mood, green lasers",
    negativePrompt: "lowres, oversaturated, deformed face, bad anatomy",
    style: "Dark Military",
    aspectRatio: "16:9",
    model: "FLUX.1 Schnell",
    sampler: "Euler Ancestral",
    cfgScale: 6.5,
    seed: 9012441,
    steps: 28,
    albumId: "operatives",
    isFavorite: false,
    created: "2026-08-26 21:40",
  },
  {
    id: "img-03",
    title: "Virtual Idol Hologram 'KIRA' Live",
    url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80",
    prompt: "Anime VTuber virtual idol singing on a holographic arena stage, particle laser beams, chromatic aberration",
    negativePrompt: "text watermark, bad hands, low resolution, 3d render look",
    style: "Anime Mecha",
    aspectRatio: "1:1",
    model: "Anime Mecha XL",
    sampler: "DPM++ SDE Karras",
    cfgScale: 8.0,
    seed: 1420853,
    steps: 32,
    albumId: "mecha",
    isFavorite: true,
    created: "2026-08-26 20:30",
  },
  {
    id: "img-04",
    title: "Quantum Mainframe Liquid Cooling Hub",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    prompt: "Supercomputer server room with glowing green liquid coolant tubes, obsidian racks, mist fog",
    negativePrompt: "blurry, dusty, noisy, overexposed",
    style: "Cyberpunk 2077",
    aspectRatio: "16:9",
    model: "SDXL 1.0 Turbo",
    sampler: "UniPC Fast Convergence",
    cfgScale: 7.0,
    seed: 6632910,
    steps: 30,
    albumId: "cyberpunk",
    isFavorite: false,
    created: "2026-08-26 19:12",
  },
  {
    id: "img-05",
    title: "Synthwave Highway Sunset 1984",
    url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80",
    prompt: "Retro sports car driving into glowing wireframe neon sun on outrun highway, magenta chrome sky",
    negativePrompt: "modern car, daytime, overcast, low quality",
    style: "Outrun Synthwave",
    aspectRatio: "16:9",
    model: "Midjourney v6.1 Synth",
    sampler: "DPM++ 2M Karras",
    cfgScale: 6.8,
    seed: 3391024,
    steps: 30,
    albumId: "synthwave",
    isFavorite: true,
    created: "2026-08-26 18:05",
  },
  {
    id: "img-06",
    title: "Combat Mecha Armor Unit-08",
    url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80",
    prompt: "Heavy assault combat mecha standing in hangar repair bay, warning decals, hydraulic pistons",
    negativePrompt: "human face, organic parts, low detail, blurry joints",
    style: "Anime Mecha",
    aspectRatio: "1:1",
    model: "Anime Mecha XL",
    sampler: "DPM++ SDE Karras",
    cfgScale: 8.5,
    seed: 7781920,
    steps: 34,
    albumId: "mecha",
    isFavorite: false,
    created: "2026-08-26 16:50",
  },
];

interface Props {
  onSelectAsset: (asset: AssetItem) => void;
  onLoadInMatrix?: (asset: AssetItem) => void;
  onEditInCanvas?: (asset: AssetItem) => void;
  selectedAssetId?: string;
}

export default function GeneratedAssetsGallery({
  onSelectAsset,
  onLoadInMatrix,
  onEditInCanvas,
  selectedAssetId,
}: Props) {
  const [albums, setAlbums] = useState<AlbumItem[]>(INITIAL_ALBUMS);
  const [assets, setAssets] = useState<AssetItem[]>(SAMPLE_ASSETS);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Inspector Modal State
  const [inspectingAsset, setInspectingAsset] = useState<AssetItem | null>(null);

  // New Album Modal State
  const [showNewAlbumModal, setShowNewAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumColor, setNewAlbumColor] = useState("#00FF41");

  // Load persistence
  useEffect(() => {
    try {
      const savedAlbums = localStorage.getItem("dirtynest_vault_albums");
      if (savedAlbums) setAlbums(JSON.parse(savedAlbums));

      const savedAssets = localStorage.getItem("dirtynest_vault_assets");
      if (savedAssets) setAssets(JSON.parse(savedAssets));
    } catch (e) {}
  }, []);

  // Save persistence
  const saveAlbums = (updated: AlbumItem[]) => {
    setAlbums(updated);
    try {
      localStorage.setItem("dirtynest_vault_albums", JSON.stringify(updated));
    } catch (e) {}
  };

  const saveAssets = (updated: AssetItem[]) => {
    setAssets(updated);
    try {
      localStorage.setItem("dirtynest_vault_assets", JSON.stringify(updated));
    } catch (e) {}
  };

  // Filter Assets
  const filteredAssets = assets.filter((item) => {
    // Album filter
    if (selectedAlbumId === "favorites" && !item.isFavorite) return false;
    if (selectedAlbumId !== "all" && selectedAlbumId !== "favorites" && item.albumId !== selectedAlbumId)
      return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.prompt.toLowerCase().includes(q) ||
        item.style.toLowerCase().includes(q) ||
        item.model?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate count per album
  const getAlbumCount = (albumId: string) => {
    if (albumId === "all") return assets.length;
    if (albumId === "favorites") return assets.filter((a) => a.isFavorite).length;
    return assets.filter((a) => a.albumId === albumId).length;
  };

  // Toggle Favorite
  const handleToggleFavorite = (e: React.MouseEvent, assetId: string) => {
    e.stopPropagation();
    cyberAudio.play("toggle");
    const updated = assets.map((a) => (a.id === assetId ? { ...a, isFavorite: !a.isFavorite } : a));
    saveAssets(updated);
    if (inspectingAsset?.id === assetId) {
      setInspectingAsset({ ...inspectingAsset, isFavorite: !inspectingAsset.isFavorite });
    }
  };

  // Change Asset Album
  const handleChangeAssetAlbum = (assetId: string, targetAlbumId: string) => {
    cyberAudio.play("click");
    const updated = assets.map((a) => (a.id === assetId ? { ...a, albumId: targetAlbumId } : a));
    saveAssets(updated);
    if (inspectingAsset?.id === assetId) {
      setInspectingAsset({ ...inspectingAsset, albumId: targetAlbumId });
    }
  };

  // Create New Album
  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;

    cyberAudio.play("warp");
    const newId = `album-${Date.now()}`;
    const newAlbum: AlbumItem = {
      id: newId,
      name: newAlbumName.trim(),
      color: newAlbumColor,
    };
    const updated = [...albums, newAlbum];
    saveAlbums(updated);
    setSelectedAlbumId(newId);
    setNewAlbumName("");
    setShowNewAlbumModal(false);
  };

  // Copy Prompt to Clipboard
  const handleCopyPrompt = (e: React.MouseEvent, id: string, promptText: string) => {
    e.stopPropagation();
    cyberAudio.play("click");
    navigator.clipboard?.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Top Header: Title & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase flex items-center gap-2">
            <span>GENERATED ASSETS VAULT //</span>
            <span className="text-[#00FF41]">ALBUMS & NEURAL METADATA</span>
          </h3>
          <p className="text-[10px] text-[#4F536E]">
            Organize artifacts into collections, inspect generation seeds & re-synthesize in 1-click
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4F536E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompt, model, style..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-black/60 border border-white/10 focus:border-[#00FF41] text-xs text-white placeholder:text-[#4F536E] outline-none w-56 font-mono"
            />
          </div>

          {/* New Album Trigger Button */}
          <button
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setShowNewAlbumModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00FF41]/15 hover:bg-[#00FF41]/25 border border-[#00FF41]/40 text-[#00FF41] text-xs font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,65,0.2)]"
          >
            <FolderPlus size={14} />
            <span>NEW ALBUM</span>
          </button>
        </div>
      </div>

      {/* Horizontal Albums Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {albums.map((alb) => {
          const isSelected = selectedAlbumId === alb.id;
          const count = getAlbumCount(alb.id);

          return (
            <button
              key={alb.id}
              type="button"
              onClick={() => {
                cyberAudio.play("click");
                setSelectedAlbumId(alb.id);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                isSelected
                  ? "bg-black/90 shadow-[0_0_12px_rgba(0,255,65,0.25)]"
                  : "bg-white/[0.03] border-white/5 text-[#9499B3] hover:text-white hover:bg-white/[0.07]"
              }`}
              style={{
                borderColor: isSelected ? alb.color : undefined,
                color: isSelected ? alb.color : undefined,
              }}
            >
              {alb.id === "favorites" ? <Star size={13} className="text-amber-400 fill-amber-400" /> : <Folder size={13} />}
              <span>{alb.name}</span>
              <span
                className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold"
                style={{
                  backgroundColor: `${alb.color}20`,
                  color: alb.color,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Artwork Cards */}
      {filteredAssets.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-2 rounded-2xl bg-black/40 border border-white/5 text-[#4F536E]">
          <Folder size={32} className="opacity-40" />
          <span className="text-xs font-bold">No generated assets found in this collection.</span>
          <span className="text-[10px]">Create new artwork in Prompt Matrix or upload images in Canvas Studio Pro.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredAssets.map((asset) => {
            const isSelected = selectedAssetId === asset.id;
            const album = albums.find((a) => a.id === asset.albumId);

            return (
              <div
                key={asset.id}
                onClick={() => {
                  cyberAudio.play("click");
                  setInspectingAsset(asset);
                }}
                className={`group p-3 rounded-2xl bg-black/50 border transition-all flex flex-col justify-between gap-2.5 cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? "border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.25)]"
                    : "border-white/10 hover:border-white/25 hover:bg-black/70"
                }`}
              >
                {/* Image Preview */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/5">
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                    style={{ backgroundImage: `url(${asset.url})` }}
                  />

                  {/* Top Overlay Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/80 backdrop-blur text-white border border-white/10">
                      {asset.aspectRatio} · {asset.model || "SDXL"}
                    </span>

                    {/* Favorite Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, asset.id)}
                      className={`p-1.5 rounded-full backdrop-blur transition-all ${
                        asset.isFavorite
                          ? "bg-amber-500/30 text-amber-400 border border-amber-500/50"
                          : "bg-black/60 text-white/50 hover:text-white"
                      }`}
                    >
                      <Star size={12} className={asset.isFavorite ? "fill-amber-400" : ""} />
                    </button>
                  </div>

                  {/* Album Tag Pill */}
                  {album && (
                    <div className="absolute bottom-2 left-2 z-10">
                      <span
                        className="text-[8px] font-bold px-2 py-0.5 rounded bg-black/80 backdrop-blur border"
                        style={{ color: album.color, borderColor: `${album.color}40` }}
                      >
                        📁 {album.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Title & Prompt Preview */}
                <div>
                  <h4 className="text-xs font-bold text-[#F1F3F9] truncate group-hover:text-[#00FF41] transition-colors">
                    {asset.title}
                  </h4>
                  <p className="text-[10px] text-[#9499B3] line-clamp-2 mt-1 leading-relaxed">
                    {asset.prompt}
                  </p>
                </div>

                {/* Card Footer: Metadata & Actions */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-[#4F536E]">
                  <div className="flex items-center gap-2">
                    <span>SEED: {asset.seed}</span>
                    <span>•</span>
                    <span>{asset.steps} STEPS</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleCopyPrompt(e, asset.id, asset.prompt)}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-[#00FF41]"
                      title="Copy Prompt"
                    >
                      {copiedId === asset.id ? <Check size={11} className="text-[#00FF41]" /> : <Copy size={11} />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cyberAudio.play("click");
                        onSelectAsset(asset);
                      }}
                      className="px-2 py-1 rounded bg-[#00FF41]/10 text-[#00FF41] font-bold hover:bg-[#00FF41]/20 border border-[#00FF41]/30"
                    >
                      INSPECT
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Asset Metadata & Detail Inspector Modal */}
      {inspectingAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-mono">
          <div
            className="w-full max-w-3xl rounded-2xl border border-white/15 p-5 flex flex-col gap-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            style={{
              background: "rgba(10, 11, 20, 0.98)",
              boxShadow: "0 20px 50px -10px rgba(0, 0, 0, 0.95), 0 0 30px rgba(0, 255, 65, 0.15)",
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white truncate max-w-md">
                    {inspectingAsset.title}
                  </h3>
                  <span className="text-[10px] text-[#4F536E]">
                    GENERATED: {inspectingAsset.created} • ID: {inspectingAsset.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleToggleFavorite(e, inspectingAsset.id)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    inspectingAsset.isFavorite
                      ? "bg-amber-500/20 border-amber-500 text-amber-400"
                      : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                  }`}
                  title="Toggle Favorite"
                >
                  <Star size={15} className={inspectingAsset.isFavorite ? "fill-amber-400" : ""} />
                </button>

                <button
                  type="button"
                  onClick={() => setInspectingAsset(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-white border border-white/10 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Main Preview Image */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-inner flex items-center justify-center">
              <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${inspectingAsset.url})` }}
              />
            </div>

            {/* Prompt Matrix Details */}
            <div className="space-y-3 text-xs">
              {/* Master Prompt */}
              <div className="p-3 rounded-xl bg-black/60 border border-white/10">
                <div className="flex items-center justify-between text-[10px] text-[#4F536E] uppercase font-bold mb-1">
                  <span>Master Prompt</span>
                  <button
                    type="button"
                    onClick={(e) => handleCopyPrompt(e, "modal-prompt", inspectingAsset.prompt)}
                    className="text-[#00FF41] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === "modal-prompt" ? <Check size={11} /> : <Copy size={11} />}
                    <span>COPY PROMPT</span>
                  </button>
                </div>
                <p className="text-white leading-relaxed">{inspectingAsset.prompt}</p>
              </div>

              {/* Negative Prompt if exists */}
              {inspectingAsset.negativePrompt && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px]">
                  <span className="text-[10px] text-[#4F536E] uppercase font-bold block mb-0.5">
                    Negative Exclusion Prompt
                  </span>
                  <p className="text-[#9499B3]">{inspectingAsset.negativePrompt}</p>
                </div>
              )}

              {/* Generation Parameters Matrix Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px]">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col">
                  <span className="text-[#4F536E] text-[8px]">MODEL ARCHITECTURE</span>
                  <span className="font-bold text-[#00FF41] truncate">{inspectingAsset.model || "SDXL Turbo"}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col">
                  <span className="text-[#4F536E] text-[8px]">SAMPLING SCHEDULER</span>
                  <span className="font-bold text-[#00F0FF] truncate">{inspectingAsset.sampler || "DPM++ 2M"}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col">
                  <span className="text-[#4F536E] text-[8px]">SEED (1-CLICK COPY)</span>
                  <button
                    type="button"
                    onClick={(e) => handleCopyPrompt(e, "modal-seed", String(inspectingAsset.seed))}
                    className="font-bold text-amber-400 hover:underline text-left"
                  >
                    {inspectingAsset.seed}
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col">
                  <span className="text-[#4F536E] text-[8px]">STEPS / CFG SCALE</span>
                  <span className="font-bold text-purple-400">
                    {inspectingAsset.steps} / {inspectingAsset.cfgScale || 7.5}
                  </span>
                </div>
              </div>

              {/* Assign to Album Select */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[11px] text-[#9499B3] font-bold">Assigned Album Collection:</span>
                <select
                  value={inspectingAsset.albumId || "cyberpunk"}
                  onChange={(e) => handleChangeAssetAlbum(inspectingAsset.id, e.target.value)}
                  className="p-1.5 rounded-lg bg-black border border-white/15 text-xs text-[#00FF41] font-mono outline-none cursor-pointer"
                >
                  {albums
                    .filter((a) => a.id !== "all" && a.id !== "favorites")
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        📁 {a.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <a
                href={inspectingAsset.url}
                download={`dirtynest-${inspectingAsset.id}.png`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 cursor-pointer"
              >
                <Download size={14} />
                <span>DOWNLOAD</span>
              </a>

              <div className="flex items-center gap-2">
                {onLoadInMatrix && (
                  <button
                    type="button"
                    onClick={() => {
                      cyberAudio.play("warp");
                      onLoadInMatrix(inspectingAsset);
                      setInspectingAsset(null);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#BF40FF]/15 border border-[#BF40FF]/40 text-[#BF40FF] hover:bg-[#BF40FF]/25 font-bold text-xs cursor-pointer transition-all shadow-[0_0_12px_rgba(191,64,255,0.2)]"
                  >
                    <Wand2 size={14} />
                    <span>LOAD IN PROMPT MATRIX</span>
                  </button>
                )}

                {onEditInCanvas && (
                  <button
                    type="button"
                    onClick={() => {
                      cyberAudio.play("warp");
                      onEditInCanvas(inspectingAsset);
                      setInspectingAsset(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00cc34] text-black font-extrabold text-xs cursor-pointer transition-all shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                  >
                    <Paintbrush size={14} />
                    <span>EDIT IN CANVAS PRO</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Album Modal */}
      {showNewAlbumModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-mono">
          <form
            onSubmit={handleCreateAlbum}
            className="w-full max-w-md rounded-2xl border border-white/15 p-5 flex flex-col gap-4 shadow-2xl relative bg-black/95"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FolderPlus size={16} className="text-[#00FF41]" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  CREATE NEW ASSET ALBUM
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewAlbumModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-[#9499B3] font-bold block mb-1">
                Album Collection Name:
              </label>
              <input
                type="text"
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                placeholder="e.g. Cyber Cityscapes, Cyberdeck Hardware..."
                className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:border-[#00FF41] outline-none font-mono"
                autoFocus
              />
            </div>

            <div>
              <label className="text-[10px] text-[#9499B3] font-bold block mb-1">
                Accent Neon Color:
              </label>
              <div className="flex items-center gap-2">
                {["#00FF41", "#00F0FF", "#BF40FF", "#FFB800", "#FF0055", "#3B82F6"].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setNewAlbumColor(col)}
                    className={`w-7 h-7 rounded-xl border transition-all ${
                      newAlbumColor === col
                        ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                        : "border-white/20 opacity-70"
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewAlbumModal(false)}
                className="px-3 py-2 rounded-xl text-xs text-[#9499B3] hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#00FF41] hover:bg-[#00cc34] text-black font-extrabold text-xs cursor-pointer shadow-[0_0_10px_rgba(0,255,65,0.3)]"
              >
                CREATE ALBUM
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
