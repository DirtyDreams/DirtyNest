"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Radio,
  Users,
  Send,
  Gift,
  Volume2,
  VolumeX,
  Flame,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface ViewerComment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  isDonation?: boolean;
  donationAmount?: number;
  timestamp: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  influencerName: string;
  influencerAvatar: string;
  influencerNiche: string;
  handle: string;
}

const SAMPLE_VIEWER_NAMES = [
  "CyberKitten",
  "NeoTokyo_Drifter",
  "PixelViper",
  "Synthia_Fan99",
  "QuantumBro",
  "GlitchMaster",
  "VesperaLover",
  "GhostInTheNet",
  "ByteStorm",
];

const SAMPLE_COMMENTS = [
  "YOOOO THAT OUTFIT IS INSANE!! 🔥",
  "Can you share the firmware update link?",
  "Love the background track! What synth is that?",
  "Greetings from Neo-Warsaw Sub-level 3! ⚡",
  "Are you collabing with DirtyNest this weekend?",
  "SHE NEVER MISSES!! 👑👑",
  "Best virtual creator on the platform hands down",
  "Notice me pleaseeee! 💜",
];

export default function LivestreamSimulatorModal({
  isOpen,
  onClose,
  influencerName,
  influencerAvatar,
  influencerNiche,
  handle,
}: Props) {
  const [viewersCount, setViewersCount] = useState(14820);
  const [likesCount, setLikesCount] = useState(48900);
  const [comments, setComments] = useState<ViewerComment[]>([
    {
      id: "comm-1",
      user: "PixelViper",
      avatar: "👾",
      text: "STREAM IS FINALLY LIVE! Let's goooo! 🔥",
      timestamp: "1m ago",
    },
    {
      id: "comm-2",
      user: "CyberKitten",
      avatar: "🐱",
      text: "Donated $50.00: Buy that new neural synthesizer! 💸",
      isDonation: true,
      donationAmount: 50,
      timestamp: "Just now",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [streamerSpeech, setStreamerSpeech] = useState(
    `*adjusts audio matrix and smiles into the camera* Welcome in everyone! We just dropped our new cyber-streetwear collection with DirtyNest. How's the bitrate in the chat?`
  );
  const [isMuted, setIsMuted] = useState(false);

  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Simulate incoming stream comments every 2.5 seconds
    const interval = setInterval(() => {
      const randomName = SAMPLE_VIEWER_NAMES[Math.floor(Math.random() * SAMPLE_VIEWER_NAMES.length)];
      const randomText = SAMPLE_COMMENTS[Math.floor(Math.random() * SAMPLE_COMMENTS.length)];
      const isDonation = Math.random() > 0.8;
      const donationAmount = isDonation ? Math.floor(Math.random() * 80) + 10 : undefined;

      const newComm: ViewerComment = {
        id: `c-${Date.now()}`,
        user: randomName,
        avatar: "👤",
        text: isDonation ? `Donated $${donationAmount}.00: ${randomText}` : randomText,
        isDonation,
        donationAmount,
        timestamp: "Just now",
      };

      setComments((prev) => [...prev.slice(-30), newComm]);
      setViewersCount((v) => v + Math.floor(Math.random() * 15) - 6);
      setLikesCount((l) => l + Math.floor(Math.random() * 10) + 2);
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  if (!isOpen) return null;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    cyberAudio.play("click");
    const userComm: ViewerComment = {
      id: `user-comm-${Date.now()}`,
      user: "You (VIP Member)",
      avatar: "👑",
      text: userInput.trim(),
      timestamp: "Just now",
    };

    setComments((prev) => [...prev, userComm]);
    const sentText = userInput.trim();
    setUserInput("");

    // Streamer answers VIP comment after short delay
    setTimeout(() => {
      cyberAudio.play("chime");
      setStreamerSpeech(
        `*glances at VIP chat feed and nods* "To VIP in the front row asking '${sentText}' — great point. We're locking in the next drop date right now!"`
      );
    }, 1800);
  };

  const handleSendDonation = () => {
    cyberAudio.play("warp");
    const donComm: ViewerComment = {
      id: `don-${Date.now()}`,
      user: "You (VIP Sponsor)",
      avatar: "💎",
      text: "SUPERCHAT $100.00: Keep pushing the boundaries of AI fashion!",
      isDonation: true,
      donationAmount: 100,
      timestamp: "Just now",
    };
    setComments((prev) => [...prev, donComm]);
    setStreamerSpeech(
      `*eyes light up with cyan HUD flare* "OMG thank you so much for the $100 Superchat!! You are fueling the neural studio for tonight's set!"`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono select-none">
      <div className="w-full max-w-4xl cyber-card bg-[#05060A] border border-red-500/40 rounded-2xl overflow-hidden shadow-[0_25px_80px_rgba(255,0,60,0.3)] flex flex-col h-[88vh]">
        {/* Top Stream Header */}
        <div className="p-4 px-5 bg-[#0D0B14] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-black animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>LIVE BROADCAST</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#F1F3F9]">{influencerName}</span>
              <span className="text-xs text-[#9499B3]">{handle}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-red-400 font-bold">
              <Users size={14} />
              <span>{viewersCount.toLocaleString()} Viewers</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#FFB800] font-bold">
              <Flame size={14} className="fill-[#FFB800]" />
              <span>{likesCount.toLocaleString()} Hype</span>
            </div>

            <button
              onClick={() => {
                cyberAudio.play("click");
                setIsMuted(!isMuted);
              }}
              className="p-1.5 text-[#9499B3] hover:text-white"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <button onClick={onClose} className="p-1.5 text-[#4F536E] hover:text-white cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Split Grid: Stream Video Stage (Left 7-cols) + Live Chat Stream (Right 5-cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0">
          {/* LEFT: Virtual Streamer Stage */}
          <div className="lg:col-span-7 p-6 bg-gradient-to-b from-black/80 via-[#090A14] to-black flex flex-col justify-between border-r border-white/10 relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,80,0.15)_0%,transparent_70%)] pointer-events-none" />

            {/* Top Stage Badges */}
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-[#9499B3] border border-white/10">
                1080p60 · RTMP SECURE
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                AI METAHUMAN SYNC: 99.8%
              </span>
            </div>

            {/* Streamer Avatar Frame */}
            <div className="flex flex-col items-center justify-center gap-4 my-auto z-10">
              <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-red-500/50 shadow-[0_0_40px_rgba(255,0,60,0.4)] bg-black flex items-center justify-center text-5xl relative animate-pulse">
                {influencerAvatar.startsWith("http") ? (
                  <img src={influencerAvatar} alt={influencerName} className="w-full h-full object-cover" />
                ) : (
                  <span>{influencerAvatar}</span>
                )}
                <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-[#00FF41] border-2 border-black" />
              </div>

              <div className="text-center">
                <h3 className="text-base font-black text-[#F1F3F9] tracking-wider">{influencerName}</h3>
                <p className="text-xs text-[#00F0FF] mt-0.5 font-mono">{influencerNiche}</p>
              </div>
            </div>

            {/* Real-time Streamer Closed Captions / Speech Bubble */}
            <div className="p-4 rounded-2xl bg-black/80 border border-white/15 text-xs text-[#F1F3F9] font-sans leading-relaxed z-10 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1.5 text-[10px] font-mono text-red-400 font-bold uppercase">
                <Radio size={12} className="animate-pulse" />
                <span>Streamer Voice Subtitles:</span>
              </div>
              <p className="italic text-[#F1F3F9] font-mono leading-relaxed">&ldquo;{streamerSpeech}&rdquo;</p>
            </div>
          </div>

          {/* RIGHT: Live Audience Chat Stream */}
          <div className="lg:col-span-5 bg-[#07080F] flex flex-col justify-between overflow-hidden">
            <div className="p-3 px-4 border-b border-white/10 flex items-center justify-between text-xs bg-black/40">
              <span className="text-[10px] uppercase font-bold text-[#4F536E]">Stream Audience Chat</span>
              <button
                onClick={handleSendDonation}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold hover:bg-amber-500/30 transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)]"
              >
                <Gift size={11} />
                <span>SUPERCHAT ($100)</span>
              </button>
            </div>

            {/* Chat Comments Stream */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-2 text-xs">
              {comments.map((comm) => (
                <div
                  key={comm.id}
                  className={`p-2.5 rounded-xl border text-xs leading-snug transition-all ${
                    comm.isDonation
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)] font-mono"
                      : comm.user.includes("You")
                      ? "bg-[#00FF41]/10 border-[#00FF41]/30 text-[#00FF41]"
                      : "bg-black/40 border-white/5 text-[#9499B3]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-[10px] mb-0.5">
                    <span className="font-bold text-[#F1F3F9] flex items-center gap-1">
                      <span>{comm.avatar}</span>
                      <span>{comm.user}</span>
                    </span>
                    <span className="text-[9px] text-[#4F536E]">{comm.timestamp}</span>
                  </div>
                  <p className="font-sans text-xs">{comm.text}</p>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>

            {/* User Stream Chat Bar */}
            <form onSubmit={handleSendComment} className="p-3 bg-[#0A0C16] border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Send a live message to the stream..."
                className="flex-1 px-3.5 py-2 bg-black/60 border border-white/10 focus:border-red-500 rounded-xl text-xs text-[#F1F3F9] outline-none font-sans"
              />
              <button
                type="submit"
                disabled={!userInput.trim()}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 font-bold text-xs cursor-pointer disabled:opacity-40"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
