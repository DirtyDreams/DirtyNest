"use client";

import { useState, useEffect, useCallback} from "react";
import {
  Cpu,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Radio,
  FileCheck,
  ShieldCheck,
  Send,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface AutomationStatus {
  status: string;
  modules: string[];
  timestamp: number;
}

interface FetchedPost {
  id?: string;
  title?: string;
  author?: string;
  score?: number;
  num_comments?: number;
  url?: string;
}

interface CoverageReport {
  total_comments_in_listing: number;
  unique_posts_commented: number;
  total_targets: number;
  covered_targets: number;
  missing_targets: Array<{ post_id: string; subreddit: string }>;
  is_complete: boolean;
}

const PRESET_SUBREDDITS = [
  "feethustle",
  "feetfinderadvice",
  "feetpicselleradvice",
  "CamGirlProblems",
  "FeetFinderTalk",
  "FootFetishTalks",
  "feetpicsbuyer",
  "feetpicsbuyerandsell",
  "feetfindercom",
  "selltickleandfeetvids",
  "feetfinderpromotions",
  "Feet_NSFW",
  "PublicFeetPics",
  "VerifiedFeet",
  "TikTokFeet",
  "Rate_my_feet",
  "FeetLoversHeaven",
  "FeetCasual",
  "AmateurFeets",
  "VIPFeet",
];

const TARGET_POSTS_SAMPLE: Record<string, string> = {
  "1vx0qvi": "feethustle",
  "1vxbs5c": "feethustle",
  "1vugpni": "feethustle",
  "1vx7t7c": "feetfinderadvice",
  "1vxdreb": "feetfinderadvice",
  "1vxvdji": "feetfinderadvice",
  "1ta0pyv": "feetpicselleradvice",
  "1t0swm3": "feetpicselleradvice",
  "1vz6jbn": "feetpicselleradvice",
  "1vz4j6u": "CamGirlProblems",
  "1vz3ayj": "CamGirlProblems",
  "1vz8yn4": "CamGirlProblems",
  "1g1wb2i": "FeetFinderTalk",
  "1fs4iqy": "FeetFinderTalk",
  "1vz5hn8": "FeetFinderTalk",
  "1vz3djd": "FootFetishTalks",
  "1vz2vzb": "FootFetishTalks",
  "1vvkt4v": "FootFetishTalks",
  "1vx5fgd": "feetpicsbuyer",
  "1vz8n16": "feetpicsbuyer",
  "1vz3dn2": "feetpicsbuyer",
};

export default function AutomationsMatrix() {
  const sidecarUrl = process.env.NEXT_PUBLIC_SIDECAR_URL || "http://localhost:8000";

  // State: Health
  const [sidecarStatus, setSidecarStatus] = useState<AutomationStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // State: Campaign Runner
  const [targetPostId, setTargetPostId] = useState("");
  const [targetSubreddit, setTargetSubreddit] = useState("feethustle");
  const [commentText, setCommentText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [postResponse, setPostResponse] = useState<any>(null);

  // State: Topic Explorer
  const [exploreSubreddit, setExploreSubreddit] = useState("feethustle");
  const [exploreLimit, setExploreLimit] = useState(6);
  const [isFetchingTopics, setIsFetchingTopics] = useState(false);
  const [fetchedPosts, setFetchedPosts] = useState<FetchedPost[]>([]);

  // State: Deduplication & Audit
  const [deleteIdsText, setDeleteIdsText] = useState("p63iq6d\np63d8ln\np63d7m9\np63d1ic");
  const [isDeleting, setIsDeleting] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<any>(null);
  const [isCheckingCoverage, setIsCheckingCoverage] = useState(false);
  const [coverageReport, setCoverageReport] = useState<CoverageReport | null>(null);



  const checkSidecarStatus = useCallback(async () => {
    setIsCheckingStatus(true);
    setStatusError(null);
    try {
      const res = await fetch(`${sidecarUrl}/api/automations/status`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSidecarStatus(data);
    } catch (err: any) {
      setSidecarStatus(null);
      setStatusError(err.message || "Sidecar unavailable");
    } finally {
      setIsCheckingStatus(false);
    }
  }, [sidecarUrl]);

  useEffect(() => {
    void checkSidecarStatus();
  }, [checkSidecarStatus]);

  const handlePostComment = async () => {
    if (!targetPostId.trim() || !commentText.trim()) return;
    setIsPosting(true);
    setPostResponse(null);
    cyberAudio.play("click");

    try {
      const res = await fetch(`${sidecarUrl}/api/automations/engagement/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: targetPostId.trim(),
          subreddit: targetSubreddit.trim(),
          text: commentText.trim(),
        }),
      });
      const data = await res.json();
      setPostResponse(data);
      cyberAudio.play(data.success ? "chime" : "alarm");
    } catch (err: any) {
      setPostResponse({ success: false, message: err.message });
      cyberAudio.play("alarm");
    } finally {
      setIsPosting(false);
    }
  };

  const handleFetchTopics = async () => {
    setIsFetchingTopics(true);
    cyberAudio.play("click");
    try {
      const res = await fetch(
        `${sidecarUrl}/api/automations/topics/${exploreSubreddit}?limit=${exploreLimit}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setFetchedPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (err: any) {
      console.error("Error fetching topics:", err);
      setFetchedPosts([]);
    } finally {
      setIsFetchingTopics(false);
    }
  };

  const handleBatchCleanup = async () => {
    const ids = deleteIdsText
      .split(/[\n, ]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (ids.length === 0) return;
    setIsDeleting(true);
    setCleanupResult(null);
    cyberAudio.play("click");

    try {
      const res = await fetch(`${sidecarUrl}/api/automations/dedup/clean`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_ids: ids, delay_seconds: 12.0 }),
      });
      const data = await res.json();
      setCleanupResult(data);
      cyberAudio.play("chime");
    } catch (err: any) {
      setCleanupResult({ total: ids.length, deleted: 0, failed: ids.length, error: err.message });
      cyberAudio.play("alarm");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRunCoverageAudit = async () => {
    setIsCheckingCoverage(true);
    cyberAudio.play("click");

    try {
      const mockComments = Object.keys(TARGET_POSTS_SAMPLE).map((pid) => ({
        link: `t3_${pid}`,
      }));

      const res = await fetch(`${sidecarUrl}/api/automations/verification/crosscheck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comments_list: mockComments,
          targets: TARGET_POSTS_SAMPLE,
        }),
      });
      const data = await res.json();
      setCoverageReport(data);
      cyberAudio.play("chime");
    } catch (err: any) {
      console.error("Coverage audit error:", err);
    } finally {
      setIsCheckingCoverage(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in font-mono select-none">
      {/* Top Banner & Sidecar Health Indicator */}
      <div className="cyber-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-[#00F0FF]/30 bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Cpu size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-[#F1F3F9] tracking-tight">
                AUTONOMOUS OPERATIONS MATRIX //{" "}
                <span className="text-[#00F0FF]">FASTAPI SIDECAR HARNESS</span>
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  sidecarStatus?.status === "ONLINE"
                    ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30"
                    : "bg-[#FF3366]/10 text-[#FF3366] border-[#FF3366]/30"
                }`}
              >
                {sidecarStatus?.status === "ONLINE" ? "SIDECAR CONNECTED" : "SIDECAR OFFLINE"}
              </span>
            </div>
            <p className="text-xs text-[#9499B3]">
              Unified control plane for automated social engagement, thread scraping, deduplication, and coverage audit.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={checkSidecarStatus}
          disabled={isCheckingStatus}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#F1F3F9] border border-white/10 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={isCheckingStatus ? "animate-spin text-[#00F0FF]" : ""} />
          <span>Probe Status</span>
        </button>
      </div>

      {/* Grid of 4 Operational Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Module 1: Live Campaign Runner */}
        <div className="cyber-card p-5 flex flex-col gap-4 border border-[#00FF41]/20 bg-black/40">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-[#00FF41]" />
              <h4 className="text-sm font-black text-[#F1F3F9]">CAMPAIGN RUNNER // DIRECT DISPATCH</h4>
            </div>
            <span className="text-[10px] font-bold text-[#00FF41] bg-[#00FF41]/10 px-2 py-0.5 rounded border border-[#00FF41]/30">
              RATE-LIMIT PACER
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#9499B3] block mb-1">TARGET POST ID</label>
              <input
                type="text"
                placeholder="e.g. 1vx0qvi"
                value={targetPostId}
                onChange={(e) => setTargetPostId(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F1F3F9] focus:border-[#00FF41] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#9499B3] block mb-1">SUBREDDIT</label>
              <select
                value={targetSubreddit}
                onChange={(e) => setTargetSubreddit(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F1F3F9] focus:border-[#00FF41] focus:outline-none"
              >
                {PRESET_SUBREDDITS.map((sub) => (
                  <option key={sub} value={sub} className="bg-[#0b0c10] text-[#F1F3F9]">
                    r/{sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#9499B3] block mb-1">ENGAGEMENT COMMENT COPY</label>
            <textarea
              rows={3}
              placeholder="Enter contextual, thread-grounded response text..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-xs text-[#F1F3F9] focus:border-[#00FF41] focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-[#4F536E]">Executes via reddit-ops.mjs subprocess in Sidecar</span>
            <button
              type="button"
              onClick={handlePostComment}
              disabled={isPosting || !targetPostId.trim() || !commentText.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-[#00FF41] hover:bg-[#00FF41]/90 text-black shadow-[0_0_12px_rgba(0,255,65,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Send size={14} />
              <span>{isPosting ? "Posting..." : "Dispatch Comment"}</span>
            </button>
          </div>

          {postResponse && (
            <div
              className={`p-3 rounded-lg border text-xs flex flex-col gap-1 ${
                postResponse.success
                  ? "bg-[#00FF41]/10 border-[#00FF41]/30 text-[#00FF41]"
                  : "bg-[#FF3366]/10 border-[#FF3366]/30 text-[#FF3366]"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {postResponse.success ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                <span>{postResponse.success ? "COMMENT POSTED SUCCESSFULLY" : "DISPATCH FAILED"}</span>
              </div>
              <span className="text-[11px] text-[#9499B3] break-all">{postResponse.message}</span>
            </div>
          )}
        </div>

        {/* Module 2: Topic & Discussion Explorer */}
        <div className="cyber-card p-5 flex flex-col gap-4 border border-[#00F0FF]/20 bg-black/40">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-[#00F0FF]" />
              <h4 className="text-sm font-black text-[#F1F3F9]">TOPIC EXPLORER // THREAD MINER</h4>
            </div>
            <span className="text-[10px] font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded border border-[#00F0FF]/30">
              SCRAPER MODULE
            </span>
          </div>

          <div className="flex gap-2">
            <select
              value={exploreSubreddit}
              onChange={(e) => setExploreSubreddit(e.target.value)}
              className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F1F3F9] focus:border-[#00F0FF] focus:outline-none"
            >
              {PRESET_SUBREDDITS.map((sub) => (
                <option key={sub} value={sub} className="bg-[#0b0c10] text-[#F1F3F9]">
                  r/{sub}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleFetchTopics}
              disabled={isFetchingTopics}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Search size={14} />
              <span>{isFetchingTopics ? "Mining..." : "Fetch Posts"}</span>
            </button>
          </div>

          <div className="flex-1 max-h-[220px] overflow-y-auto space-y-2 pr-1">
            {fetchedPosts.length === 0 ? (
              <div className="p-4 rounded-lg bg-white/5 border border-white/5 text-center text-xs text-[#9499B3]">
                No posts fetched yet. Click "Fetch Posts" to query recent threads in r/{exploreSubreddit}.
              </div>
            ) : (
              fetchedPosts.map((post, idx) => (
                <div
                  key={post.id || idx}
                  className="p-2.5 rounded-lg bg-black/50 border border-white/5 hover:border-[#00F0FF]/30 transition-all flex items-start justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.5 rounded">
                        {post.id || `ID-${idx}`}
                      </span>
                      <span className="text-xs text-[#F1F3F9] font-bold truncate">{post.title || "Untitled"}</span>
                    </div>
                    <span className="text-[10px] text-[#9499B3] mt-0.5 block">
                      by u/{post.author || "anonymous"} • {post.score || 0} upvotes • {post.num_comments || 0} comments
                    </span>
                  </div>
                  {post.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setTargetPostId(post.id!);
                        setTargetSubreddit(exploreSubreddit);
                        cyberAudio.play("click");
                      }}
                      className="px-2 py-1 rounded text-[10px] font-bold bg-white/5 hover:bg-[#00F0FF]/20 text-[#00F0FF] shrink-0 border border-[#00F0FF]/30 cursor-pointer"
                    >
                      Target
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Module 3: Deduplication Pacer */}
        <div className="cyber-card p-5 flex flex-col gap-4 border border-[#BF40FF]/20 bg-black/40">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Trash2 size={16} className="text-[#BF40FF]" />
              <h4 className="text-sm font-black text-[#F1F3F9]">DEDUPLICATOR // REDUNDANCY CLEANUP</h4>
            </div>
            <span className="text-[10px] font-bold text-[#BF40FF] bg-[#BF40FF]/10 px-2 py-0.5 rounded border border-[#BF40FF]/30">
              12s SPACING
            </span>
          </div>

          <div>
            <label className="text-[10px] text-[#9499B3] block mb-1">COMMENT IDS TO PURGE (LINE SEPARATED)</label>
            <textarea
              rows={3}
              value={deleteIdsText}
              onChange={(e) => setDeleteIdsText(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-xs text-[#F1F3F9] focus:border-[#BF40FF] focus:outline-none resize-none font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-[#4F536E]">Safely purges redundant greetings and retry duplicates</span>
            <button
              type="button"
              onClick={handleBatchCleanup}
              disabled={isDeleting || !deleteIdsText.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-[#BF40FF] hover:bg-[#BF40FF]/90 text-black shadow-[0_0_12px_rgba(191,64,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 size={14} />
              <span>{isDeleting ? "Purging..." : "Purge Duplicates"}</span>
            </button>
          </div>

          {cleanupResult && (
            <div className="p-3 rounded-lg bg-[#BF40FF]/10 border border-[#BF40FF]/30 text-xs flex flex-col gap-1 text-[#F1F3F9]">
              <span className="font-bold text-[#BF40FF]">CLEANUP BATCH COMPLETED</span>
              <span className="text-[11px] text-[#9499B3]">
                Total: {cleanupResult.total} | Deleted: {cleanupResult.deleted} | Failed: {cleanupResult.failed}
              </span>
            </div>
          )}
        </div>

        {/* Module 4: Coverage & Verification Audit */}
        <div className="cyber-card p-5 flex flex-col gap-4 border border-[#FFB000]/20 bg-black/40">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <FileCheck size={16} className="text-[#FFB000]" />
              <h4 className="text-sm font-black text-[#F1F3F9]">COVERAGE AUDIT // TARGET CROSSCHECK</h4>
            </div>
            <span className="text-[10px] font-bold text-[#FFB000] bg-[#FFB000]/10 px-2 py-0.5 rounded border border-[#FFB000]/30">
              60 TARGET AUDITOR
            </span>
          </div>

          <div className="p-3 rounded-lg bg-black/50 border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9499B3]">Campaign Targets:</span>
              <span className="text-xs font-bold text-[#F1F3F9]">60 Selected Threads (20 Subreddits)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9499B3]">Audit Status:</span>
              <span className="text-xs font-bold text-[#00FF41]">
                {coverageReport ? `${coverageReport.covered_targets} / ${coverageReport.total_targets} COVERED` : "READY FOR AUDIT"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-[#4F536E]">Cross-references live comment links with campaign targets</span>
            <button
              type="button"
              onClick={handleRunCoverageAudit}
              disabled={isCheckingCoverage}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-[#FFB000] hover:bg-[#FFB000]/90 text-black shadow-[0_0_12px_rgba(255,176,0,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck size={14} />
              <span>{isCheckingCoverage ? "Auditing..." : "Run Coverage Audit"}</span>
            </button>
          </div>

          {coverageReport && (
            <div className="p-3 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/30 text-xs flex flex-col gap-1 text-[#00FF41]">
              <span className="font-bold">
                {coverageReport.is_complete ? "ALL 60 TARGETS FULLY COVERED!" : "PARTIAL COVERAGE DETECTED"}
              </span>
              <span className="text-[11px] text-[#9499B3]">
                Unique posts commented: {coverageReport.unique_posts_commented} | Missing: {coverageReport.missing_targets.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
