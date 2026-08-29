"use client";

import { useState } from "react";
import { Share2, Save } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";
import { useToast } from "@/components/common/ToastProvider";

export default function SocialMediaSettingsTab() {
  const [autoPublishEnabled, setAutoPublishEnabled] = useState(false);
  const [defaultChannels, setDefaultChannels] = useState(["twitter", "discord", "telegram"]);
  const [rateLimitPerHour, setRateLimitPerHour] = useState(4);
  const [enableHermesAutoReply, setEnableHermesAutoReply] = useState(true);
  const [saved, setSaved] = useState(false);
  const toast = useToast();

  const handleSave = () => {
    cyberAudio.play("chime");
    setSaved(true);
    toast.success("Social Media Settings Saved", "Broadcasting rules & channels updated.");
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleChannel = (ch: string) => {
    cyberAudio.play("click");
    setDefaultChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  return (
    <div className="space-y-6 font-mono select-none animate-fade-in">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-[#00F0FF]/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF]">
            <Share2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#F1F3F9] tracking-wider uppercase">
              SOCIAL MEDIA CONFIGURATION // <span className="text-[#00F0FF]">BROADCAST RULES</span>
            </h3>
            <p className="text-xs text-[#9499B3]">
              Default connected channels, rate limits, Hermes autonomous copywriting & engagement auto-replies
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#00F0FF] text-black font-black text-xs hover:bg-[#00d4e0] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)]"
        >
          <Save size={13} />
          <span>{saved ? "SAVED!" : "SAVE SETTINGS"}</span>
        </button>
      </div>

      <div className="cyber-card p-5 space-y-4">
        {/* Connected Channels */}
        <div>
          <label className="text-[10px] font-bold text-[#4F536E] uppercase block mb-2">
            Default Active Broadcasting Channels
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "twitter", label: "X / Twitter", color: "#00F0FF" },
              { id: "discord", label: "Discord Announce", color: "#BF40FF" },
              { id: "telegram", label: "Telegram Channel", color: "#00FF41" },
              { id: "reddit", label: "Reddit /r/Cyberpunk", color: "#FFB800" },
            ].map((ch) => {
              const isSelected = defaultChannels.includes(ch.id);

              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => toggleChannel(ch.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-black/80 shadow-[0_0_10px_currentColor]"
                      : "bg-black/20 border-white/5 opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    borderColor: isSelected ? ch.color : undefined,
                    color: isSelected ? ch.color : "#9499B3",
                  }}
                >
                  <span className="text-xs font-bold">{ch.label}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? "" : "border border-white/20"}`} style={{ background: isSelected ? ch.color : undefined }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Rate Limits & Auto-Publish */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#9499B3]">Max Scheduled Dispatches Per Hour</span>
              <span className="text-[#00FF41] font-bold">{rateLimitPerHour} posts/hr</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              value={rateLimitPerHour}
              onChange={(e) => setRateLimitPerHour(parseInt(e.target.value))}
              className="w-full accent-[#00FF41] cursor-pointer mt-2"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#F1F3F9] block">Hermes Auto-Reply to Mentions</span>
              <span className="text-[10px] text-[#4F536E]">Autonomous social engagement bot</span>
            </div>
            <input
              type="checkbox"
              checked={enableHermesAutoReply}
              onChange={(e) => setEnableHermesAutoReply(e.target.checked)}
              className="w-4 h-4 accent-[#00F0FF] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
