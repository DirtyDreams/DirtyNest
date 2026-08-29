"use client";

import { useState } from "react";
import { Sparkles, Search, Play } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface HermesSkill {
  id: string;
  name: string;
  category: "Security" | "DevOps" | "Code" | "Research" | "Automation";
  description: string;
  createdDate: string;
  invocations: number;
  successRate: number;
  tags: string[];
}

const HERMES_SKILLS: HermesSkill[] = [
  {
    id: "skill-cve-triage",
    name: "CVE Triage & 1-Click Patch Synthesizer",
    category: "Security",
    description:
      "Automatically ingests CVE disclosures, traces AST call graphs in src/, and drafts isolated patches.",
    createdDate: "2026-08-21",
    invocations: 142,
    successRate: 99.4,
    tags: ["CVE", "AST", "AppSec"],
  },
  {
    id: "skill-pr-velocity",
    name: "Autonomous PR Review & Diff Hardener",
    category: "Code",
    description:
      "Performs static SAST review, ensures zero 'any' types in TypeScript, and runs performance budgets.",
    createdDate: "2026-08-22",
    invocations: 388,
    successRate: 99.8,
    tags: ["GitHub", "TypeScript", "Lint"],
  },
  {
    id: "skill-docker-hygiene",
    name: "Container Mesh Health & Auto-Prune",
    category: "DevOps",
    description:
      "Monitors socket connections, unmapped ports, and runs automated vacuum on dangling build layers.",
    createdDate: "2026-08-23",
    invocations: 92,
    successRate: 100.0,
    tags: ["Docker", "Socket", "Prune"],
  },
  {
    id: "skill-sqlite-fts5",
    name: "Persistent Memory Index & B-Tree Balancer",
    category: "Automation",
    description:
      "Re-indexes SQLite FTS5 virtual tables and consolidates vector embeddings for sub-10ms recall.",
    createdDate: "2026-08-24",
    invocations: 512,
    successRate: 99.9,
    tags: ["SQLite", "FTS5", "Vector"],
  },
  {
    id: "skill-threat-intel",
    name: "Multi-Source Threat Briefing Synthesizer",
    category: "Research",
    description:
      "Scrapes RSS security feeds, summarizes zero-day advisories, and formats executive markdown briefs.",
    createdDate: "2026-08-25",
    invocations: 230,
    successRate: 98.7,
    tags: ["RSS", "ThreatIntel", "Markdown"],
  },
  {
    id: "skill-audio-synthesizer",
    name: "Cyber Focus Soundscape Modulator",
    category: "Automation",
    description:
      "Dynamically modulates Web Audio API binaural beats based on current operator typing velocity.",
    createdDate: "2026-08-26",
    invocations: 74,
    successRate: 100.0,
    tags: ["WebAudio", "DSP", "Focus"],
  },
];

export default function HermesSkillBrowser() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [runningSkillId, setRunningSkillId] = useState<string | null>(null);

  const categories = ["ALL", "Security", "Code", "DevOps", "Research", "Automation"];

  const filteredSkills = HERMES_SKILLS.filter((s) => {
    const matchesCat = activeCategory === "ALL" || s.category === activeCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleTriggerSkill = (id: string) => {
    cyberAudio.play("toggle");
    setRunningSkillId(id);
    setTimeout(() => {
      cyberAudio.play("chime");
      setRunningSkillId(null);
    }, 2000);
  };

  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col gap-4 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] tracking-wider uppercase">
              HERMES SKILL REGISTRY // <span className="text-[#00FF41]">SELF-CREATED SKILLS</span>
            </h3>
            <p className="text-[10px] text-[#4F536E]">
              Autonomous learning loop: successful workflows abstracted into reusable agent skills
            </p>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4F536E]" />
          <input
            type="text"
            placeholder="Search skills or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-black/60 border border-white/10 focus:border-[#00FF41] rounded-xl text-xs text-[#F1F3F9] outline-none"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              cyberAudio.play("click");
              setActiveCategory(cat);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeCategory === cat
                ? "bg-[#00FF41] text-black shadow-[0_0_10px_rgba(0,255,65,0.3)]"
                : "bg-white/5 text-[#9499B3] hover:text-[#F1F3F9] hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredSkills.map((skill) => {
          const isRunning = runningSkillId === skill.id;

          return (
            <div
              key={skill.id}
              className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between gap-3 hover:border-white/15 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-[#00F0FF] border border-white/10 uppercase">
                    {skill.category}
                  </span>
                  <span className="text-[9px] text-[#00FF41] font-bold">
                    {skill.successRate}% SUCCESS
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#F1F3F9] mt-2 leading-snug">
                  {skill.name}
                </h4>

                <p className="text-[11px] text-[#9499B3] mt-1 line-clamp-2 leading-relaxed">
                  {skill.description}
                </p>
              </div>

              <div>
                {/* Tags */}
                <div className="flex items-center gap-1 flex-wrap mb-3">
                  {skill.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-black/80 border border-white/5 text-[#4F536E]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Footer and Trigger */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                  <span className="text-[9px] text-[#4F536E]">
                    Used {skill.invocations} times
                  </span>

                  <button
                    type="button"
                    onClick={() => handleTriggerSkill(skill.id)}
                    disabled={isRunning}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isRunning
                        ? "bg-[#00FF41] text-black shadow-[0_0_12px_rgba(0,255,65,0.5)] animate-pulse"
                        : "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25"
                    }`}
                  >
                    <Play size={10} />
                    <span>{isRunning ? "RUNNING..." : "TRIGGER"}</span>
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
