"use client";

import { useMemo, useState, useEffect } from "react";
import { GitCommit, GitPullRequest, Star, GitBranch, Copy, Check } from "lucide-react";

// Deterministic mock contribution generator
function generateDeterministicContributions() {
  const weeks = 14;
  const data: { count: number; date: string }[][] = [];
  
  const now = new Date();
  for (let w = 0; w < weeks; w++) {
    const week: { count: number; date: string }[] = [];
    for (let d = 0; d < 7; d++) {
      const daysAgo = (weeks - 1 - w) * 7 + (6 - d);
      const cellDate = new Date(now);
      cellDate.setDate(cellDate.getDate() - daysAgo);
      const dateStr = cellDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const val = Math.floor((Math.sin(w * 3.7 + d * 1.9) + 1) * 3.5);
      const isZero = (w * 7 + d) % 3 === 0;
      week.push({ count: isZero ? 0 : val, date: dateStr });
    }
    data.push(week);
  }
  return data;
}

function getContribStyle(count: number) {
  if (count === 0) return { bg: "rgba(255, 255, 255, 0.04)", shadow: "none" };
  if (count <= 2) return { bg: "rgba(0, 255, 65, 0.22)", shadow: "none" };
  if (count <= 4) return { bg: "rgba(0, 255, 65, 0.45)", shadow: "0 0 6px rgba(0, 255, 65, 0.2)" };
  if (count <= 6) return { bg: "rgba(0, 255, 65, 0.75)", shadow: "0 0 8px rgba(0, 255, 65, 0.4)" };
  return { bg: "#00FF41", shadow: "0 0 12px rgba(0, 255, 65, 0.8)" };
}

const mockCommits = [
  { repo: "dirty-nest", branch: "main", message: "feat: add command palette with fuzzy search", time: "2h ago", sha: "a3f8c21" },
  { repo: "api-gateway", branch: "staging", message: "fix: token refresh race condition", time: "5h ago", sha: "b7d2e45" },
  { repo: "dirty-nest", branch: "main", message: "style: cyberpunk theme system & neon HUD", time: "8h ago", sha: "c1a9f38" },
  { repo: "infra-tools", branch: "k8s-v2", message: "chore: update docker compose configurations", time: "1d ago", sha: "d4e6b12" },
];

export default function GitHubActivity() {
  const [mounted, setMounted] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ count: number; date: string } | null>(null);
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const contributions = useMemo(() => generateDeterministicContributions(), []);
  const totalContribs = useMemo(
    () => contributions.flat().reduce((a, b) => a + b.count, 0),
    [contributions]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyHash = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 1500);
  };

  return (
    <div className="cyber-card p-5 relative">
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <div className="widget-header">
        <GitBranch size={15} className="icon" />
        <h3>Git Activity & Commits</h3>
        <span className="ml-auto text-[10px] font-mono text-[#BF40FF] px-2 py-0.5 rounded bg-[#BF40FF]/10 border border-[#BF40FF]/20">
          BRANCH: MAIN
        </span>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#00FF41]/10 text-[#00FF41]">
            <GitCommit size={15} />
          </div>
          <div>
            <div
              className="text-base font-mono font-bold text-[#00FF41] leading-none"
              suppressHydrationWarning
            >
              {mounted ? totalContribs : 342}
            </div>
            <div className="text-[10px] text-[#9499B3] font-mono mt-0.5">Commits</div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#BF40FF]/10 text-[#BF40FF]">
            <GitPullRequest size={15} />
          </div>
          <div>
            <div className="text-base font-mono font-bold text-[#BF40FF] leading-none">
              8
            </div>
            <div className="text-[10px] text-[#9499B3] font-mono mt-0.5">Merged PRs</div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#FFB800]/10 text-[#FFB800]">
            <Star size={15} />
          </div>
          <div>
            <div className="text-base font-mono font-bold text-[#FFB800] leading-none">
              18
            </div>
            <div className="text-[10px] text-[#9499B3] font-mono mt-0.5">Stars</div>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-mono text-[#9499B3]">
            {hoveredCell ? (
              <span className="text-[#00FF41] font-bold">
                {hoveredCell.date}: {hoveredCell.count} contribution{hoveredCell.count !== 1 ? "s" : ""}
              </span>
            ) : (
              <span>Last 98 days activity</span>
            )}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#4F536E]">
            <span>Less</span>
            {[0, 2, 4, 6, 8].map((lvl) => {
              const st = getContribStyle(lvl);
              return (
                <div
                  key={lvl}
                  className="w-2.5 h-2.5 rounded-[2px]"
                  style={{ background: st.bg, boxShadow: st.shadow }}
                />
              );
            })}
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex gap-[4px]">
            {contributions.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[4px]">
                {week.map((cell, di) => {
                  const style = getContribStyle(cell.count);
                  return (
                    <div
                      key={di}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className="rounded-[3px] transition-transform duration-150 hover:scale-125 cursor-pointer"
                      style={{
                        width: "14px",
                        height: "14px",
                        background: style.bg,
                        boxShadow: style.shadow,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Commit History */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#4F536E] mb-1">
          Recent Revisions
        </div>
        {mockCommits.map((commit) => (
          <div
            key={commit.sha}
            className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg transition-all duration-150 group"
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.03)",
            }}
          >
            <button
              onClick={() => copyHash(commit.sha)}
              title="Copy commit hash"
              className="px-1.5 py-0.5 rounded font-mono text-[10px] text-[#BF40FF] bg-[#BF40FF]/10 hover:bg-[#BF40FF]/25 transition-colors flex items-center gap-1 shrink-0"
            >
              {copiedSha === commit.sha ? (
                <Check size={10} className="text-[#00FF41]" />
              ) : (
                <Copy size={10} />
              )}
              <span>{commit.sha}</span>
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#F1F3F9] truncate font-medium group-hover:text-[#00FF41] transition-colors">
                {commit.message}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-[#4F536E] font-mono mt-0.5">
                <span className="text-[#9499B3]">{commit.repo}</span>
                <span>•</span>
                <span>{commit.branch}</span>
                <span>•</span>
                <span>{commit.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
