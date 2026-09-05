"use client";

import { useState } from "react";
import {
  Sparkles,
  Check,
  Award,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export default function NexusContextDeck() {
  const [activeTalent, _setActiveTalent] = useState({
    name: "Aria Neon",
    handle: "@aria_neon",
    avatar: "✨",
    niche: "High Fashion",
    followers: "2.45M",
    revenue: "$34,500/mo",
    engagement: "7.8%",
  });

  const [postDrafts, setPostDrafts] = useState([
    {
      id: "draft-1",
      title: "Neo-Tokyo Runway Lookbook",
      niche: "Fashion",
      status: "ready",
    },
    {
      id: "draft-2",
      title: "Sub-node Synth Session Reel",
      niche: "Music",
      status: "ready",
    },
  ]);

  const [brandOffers, setBrandOffers] = useState([
    {
      id: "off-1",
      brand: "AetherGlow",
      payout: "$14,500",
      accepted: false,
    },
    {
      id: "off-2",
      brand: "Militech Lab",
      payout: "$22,000",
      accepted: true,
    },
  ]);

  const handlePublishDraft = (id: string) => {
    cyberAudio.play("warp");
    setPostDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAcceptOffer = (id: string) => {
    cyberAudio.play("chime");
    setBrandOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, accepted: true } : o))
    );
  };

  return (
    <div className="flex flex-col gap-3 font-mono text-xs animate-fade-in w-full">
      {/* Active Talent Mini-HUD */}
      <div className="cyber-card p-3.5 bg-black/60 border border-[#00FF41]/30 rounded-xl space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{activeTalent.avatar}</span>
            <div className="flex flex-col min-w-0">
              <span className="font-black text-[#F1F3F9] text-xs truncate">
                {activeTalent.name}
              </span>
              <span className="text-[10px] text-[#00FF41]">{activeTalent.handle}</span>
            </div>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30">
            {activeTalent.niche}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-1 text-center text-[10px]">
          <div className="p-1.5 rounded bg-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">Reach</span>
            <span className="font-bold text-[#00FF41]">{activeTalent.followers}</span>
          </div>
          <div className="p-1.5 rounded bg-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">Engagement</span>
            <span className="font-bold text-[#00F0FF]">{activeTalent.engagement}</span>
          </div>
          <div className="p-1.5 rounded bg-white/5">
            <span className="text-[8px] text-[#4F536E] uppercase block">Revenue</span>
            <span className="font-bold text-[#FFB800]">{activeTalent.revenue}</span>
          </div>
        </div>
      </div>

      {/* Viral Post Queue Mini-Widget */}
      <div className="cyber-card p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#00F0FF]">
            <Sparkles size={13} />
            <span className="font-bold text-[10px] uppercase tracking-wider">
              Viral Post Queue ({postDrafts.length})
            </span>
          </div>
        </div>

        {postDrafts.length > 0 ? (
          <div className="space-y-1.5">
            {postDrafts.map((draft) => (
              <div
                key={draft.id}
                className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between gap-2"
              >
                <span className="text-[11px] text-[#F1F3F9] font-sans truncate">
                  {draft.title}
                </span>
                <button
                  onClick={() => handlePublishDraft(draft.id)}
                  className="px-2 py-1 rounded bg-[#00FF41]/15 text-[#00FF41] hover:bg-[#00FF41]/25 border border-[#00FF41]/30 text-[9px] font-bold shrink-0 cursor-pointer"
                >
                  Publish
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2 text-center text-[10px] text-[#4F536E]">
            All drafts published to social feeds!
          </div>
        )}
      </div>

      {/* Brand Sponsorships Radar */}
      <div className="cyber-card p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#FFB800]">
            <Award size={13} />
            <span className="font-bold text-[10px] uppercase tracking-wider">
              Brand Deals Radar
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          {brandOffers.map((offer) => (
            <div
              key={offer.id}
              className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[11px] text-[#F1F3F9] font-bold truncate">
                  {offer.brand}
                </span>
                <span className="text-[10px] text-[#FFB800]">{offer.payout}</span>
              </div>

              {offer.accepted ? (
                <span className="text-[8px] font-bold text-amber-400 flex items-center gap-0.5">
                  <Check size={10} /> Active
                </span>
              ) : (
                <button
                  onClick={() => handleAcceptOffer(offer.id)}
                  className="px-2 py-1 rounded bg-[#00F0FF]/15 text-[#00F0FF] hover:bg-[#00F0FF]/25 border border-[#00F0FF]/30 text-[9px] font-bold shrink-0 cursor-pointer"
                >
                  Accept
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
