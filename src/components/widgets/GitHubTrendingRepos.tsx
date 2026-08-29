"use client";

import { useState } from "react";
import {
  Star,
  TrendingUp,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface TrendingRepo {
  name: string;
  owner: string;
  description: string;
  language: string;
  langColor: string;
  totalStars: string;
  starsToday: string;
  url: string;
}

const TRENDING_REPOS: TrendingRepo[] = [
  {
    name: "DirtyNest",
    owner: "DirtyDreams",
    description: "Next-gen cybernetic workstation, multi-agent AI swarm orchestrator & metahuman studio.",
    language: "TypeScript",
    langColor: "#3178C6",
    totalStars: "14.2k",
    starsToday: "+1,240 stars today",
    url: "https://github.com/DirtyDreams/DirtyNest",
  },
  {
    name: "sqlite-vec",
    owner: "asg017",
    description: "A vector search SQLite extension that runs anywhere with SIMD acceleration.",
    language: "C",
    langColor: "#555555",
    totalStars: "8.9k",
    starsToday: "+820 stars today",
    url: "https://github.com/asg017/sqlite-vec",
  },
  {
    name: "ollama",
    owner: "ollama",
    description: "Get up and running with Llama 3.3, DeepSeek-R1, and other large language models.",
    language: "Go",
    langColor: "#00ADD8",
    totalStars: "118k",
    starsToday: "+950 stars today",
    url: "https://github.com/ollama/ollama",
  },
  {
    name: "ratatui",
    owner: "ratatui-org",
    description: "Rust library that's all about cooking up terminal user interfaces.",
    language: "Rust",
    langColor: "#DEA584",
    totalStars: "12.4k",
    starsToday: "+430 stars today",
    url: "https://github.com/ratatui-org/ratatui",
  },
];

export default function GitHubTrendingRepos() {
  const [selectedLang, setSelectedLang] = useState<string>("All");

  const filtered = TRENDING_REPOS.filter((r) =>
    selectedLang === "All" ? true : r.language === selectedLang
  );

  return (
    <div className="cyber-card p-4 sm:p-5 bg-[#080912] border border-white/10 rounded-2xl flex flex-col gap-4 font-mono select-none shadow-lg hover:border-[#00FF41]/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41]">
            <TrendingUp size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              GITHUB TRENDING RADAR
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              High-Velocity Open Source Repositories
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-black/40 rounded-lg border border-white/5 text-[9px]">
          {["All", "TypeScript", "Rust", "Go"].map((lang) => (
            <button
              key={lang}
              onClick={() => {
                cyberAudio.play("click");
                setSelectedLang(lang);
              }}
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                selectedLang === lang
                  ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                  : "text-[#9499B3] hover:text-white"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Repos List */}
      <div className="space-y-2 pt-1">
        {filtered.map((repo) => (
          <a
            key={repo.name}
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-[#00FF41]/30 flex flex-col gap-1.5 transition-all block group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[10px] text-[#4F536E]">{repo.owner} /</span>
                <span className="font-bold text-xs text-[#F1F3F9] group-hover:text-[#00FF41] transition-colors truncate">
                  {repo.name}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-amber-300 font-bold shrink-0">
                <Star size={11} className="fill-amber-300" />
                <span>{repo.totalStars}</span>
              </div>
            </div>

            <p className="text-[10px] text-[#9499B3] font-sans line-clamp-1">
              {repo.description}
            </p>

            <div className="flex items-center justify-between text-[9px] text-[#4F536E] pt-0.5 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: repo.langColor }}
                />
                <span className="text-[#9499B3]">{repo.language}</span>
              </div>
              <span className="text-[#00FF41] font-bold">{repo.starsToday}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
