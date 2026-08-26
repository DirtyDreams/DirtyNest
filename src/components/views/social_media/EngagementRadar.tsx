"use client";

import { useState } from "react";
import { TrendingUp, Users, Heart, Share2, BarChart3, Activity } from "lucide-react";

interface ChannelStat {
  channel: string;
  color: string;
  followers: number;
  growthPct: number;
  impressions7d: number;
  engagementPct: number;
  sentimentPct: number;
}

const CHANNELS: ChannelStat[] = [
  {
    channel: "X / Twitter",
    color: "#00F0FF",
    followers: 18420,
    growthPct: 14.8,
    impressions7d: 142000,
    engagementPct: 6.4,
    sentimentPct: 94.2,
  },
  {
    channel: "Discord Community",
    color: "#BF40FF",
    followers: 6840,
    growthPct: 22.4,
    impressions7d: 89000,
    engagementPct: 18.2,
    sentimentPct: 98.6,
  },
  {
    channel: "Telegram Channel",
    color: "#00FF41",
    followers: 9200,
    growthPct: 8.9,
    impressions7d: 64000,
    engagementPct: 11.5,
    sentimentPct: 92.0,
  },
  {
    channel: "Reddit /r/Cyberpunk",
    color: "#FFB800",
    followers: 4210,
    growthPct: 31.0,
    impressions7d: 112000,
    engagementPct: 8.7,
    sentimentPct: 89.5,
  },
];

export default function EngagementRadar() {
  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <TrendingUp size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              ENGAGEMENT & AUDIENCE RADAR // <span className="text-[#00FF41]">7-DAY TELEMETRY</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Omnichannel impression reach, engagement ratios & sentiment diagnostics
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/30">
          VIRAL COEFFICIENT: 1.84x
        </span>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
          <span className="text-[9px] text-[#4F536E] uppercase">Total Impressions</span>
          <span className="text-lg font-black text-[#00F0FF]">407,000</span>
          <span className="text-[9px] text-[#00FF41] font-bold">+18.4% this week</span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
          <span className="text-[9px] text-[#4F536E] uppercase">Avg Engagement</span>
          <span className="text-lg font-black text-[#00FF41]">11.2%</span>
          <span className="text-[9px] text-[#00FF41] font-bold">Top 5% in tech</span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
          <span className="text-[9px] text-[#4F536E] uppercase">Total Community</span>
          <span className="text-lg font-black text-[#BF40FF]">38,670</span>
          <span className="text-[9px] text-[#BF40FF] font-bold">+2,480 operatives</span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
          <span className="text-[9px] text-[#4F536E] uppercase">Sentiment Score</span>
          <span className="text-lg font-black text-[#FFB800]">94.8%</span>
          <span className="text-[9px] text-[#00FF41] font-bold">Positive resonance</span>
        </div>
      </div>

      {/* Channel Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-[10px] text-[#4F536E] uppercase font-bold">
              <th className="py-2.5 px-3">Broadcast Channel</th>
              <th className="py-2.5 px-3">Followers</th>
              <th className="py-2.5 px-3">Growth (7d)</th>
              <th className="py-2.5 px-3">Impressions</th>
              <th className="py-2.5 px-3">Engagement</th>
              <th className="py-2.5 px-3">Sentiment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {CHANNELS.map((ch) => (
              <tr key={ch.channel} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: ch.color }} />
                    <span className="font-bold text-[#F1F3F9]">{ch.channel}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 font-bold text-[#F1F3F9]">{ch.followers.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-[#00FF41] font-bold">+{ch.growthPct}%</td>
                <td className="py-2.5 px-3 text-[#00F0FF]">{ch.impressions7d.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-[#BF40FF] font-bold">{ch.engagementPct}%</td>
                <td className="py-2.5 px-3 text-[#00FF41] font-bold">{ch.sentimentPct}% Positive</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
