"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, Radio, Terminal } from "lucide-react";
import { cyberSpeech } from "@/lib/cyberSpeech";
import { cyberAudio } from "@/lib/cyberAudio";

interface VoiceOpsBarProps {
  onCommandRecognized?: (command: string) => void;
}

export default function VoiceOpsBar({ onCommandRecognized }: VoiceOpsBarProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const handleSpeechStart = () => setIsSpeaking(true);
    const handleSpeechEnd = () => setIsSpeaking(false);
    const handleVoiceStart = () => setIsListening(true);
    const handleVoiceEnd = () => setIsListening(false);

    if (typeof window !== "undefined") {
      window.addEventListener("dirtynest-speech-start", handleSpeechStart);
      window.addEventListener("dirtynest-speech-end", handleSpeechEnd);
      window.addEventListener("dirtynest-voice-listening", handleVoiceStart);
      window.addEventListener("dirtynest-voice-stop", handleVoiceEnd);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("dirtynest-speech-start", handleSpeechStart);
        window.removeEventListener("dirtynest-speech-end", handleSpeechEnd);
        window.removeEventListener("dirtynest-voice-listening", handleVoiceStart);
        window.removeEventListener("dirtynest-voice-stop", handleVoiceEnd);
      }
    };
  }, []);

  const toggleListening = () => {
    cyberAudio.play("click");
    if (isListening) {
      cyberSpeech.stopListening();
      setIsListening(false);
    } else {
      setTranscript("");
      const started = cyberSpeech.startListening({
        continuous: false,
        onTranscript: (text, isFinal) => {
          setTranscript(text);
          if (isFinal) {
            cyberAudio.play("chime");
            if (onCommandRecognized) {
              onCommandRecognized(text);
            }
            if (ttsEnabled) {
              cyberSpeech.speak(`Command received: ${text}`, { pitch: 1.0, rate: 1.1 });
            }
          }
        },
        onError: (err) => {
          setTranscript(`[Voice Error: ${err}]`);
          cyberAudio.play("error");
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        },
      });

      if (started) {
        setIsListening(true);
        cyberAudio.play("blip");
      }
    }
  };

  const toggleTts = () => {
    cyberAudio.play("click");
    if (ttsEnabled) {
      cyberSpeech.stop();
    }
    setTtsEnabled(!ttsEnabled);
  };

  const handleQuickDirective = (cmd: string) => {
    cyberAudio.play("click");
    setTranscript(cmd);
    if (onCommandRecognized) {
      onCommandRecognized(cmd);
    }
    if (ttsEnabled) {
      cyberSpeech.speak(`Executing: ${cmd}`, { pitch: 1.0, rate: 1.1 });
    }
  };

  return (
    <div className="cyber-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3 border border-white/10 bg-black/50">
      {/* Left: Status & Microphone Toggle */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={toggleListening}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
            isListening
              ? "bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(255,0,60,0.4)] animate-pulse"
              : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-[#00FF41]/40"
          }`}
        >
          {isListening ? <Mic size={15} /> : <MicOff size={15} />}
          <span>{isListening ? "LISTENING (MIC ACTIVE)" : "VOICE CONTROL"}</span>
        </button>

        {/* Audio Waveform Simulation */}
        <div className="flex items-center gap-1 h-5 px-2 bg-black/40 rounded-lg border border-white/5">
          <Radio
            size={12}
            className={isListening ? "text-red-400 animate-pulse" : isSpeaking ? "text-[#00FF41] animate-pulse" : "text-[#4F536E]"}
          />
          <div className="flex items-end gap-0.5 h-3">
            {[6, 12, 8, 14, 10, 4].map((h, i) => (
              <span
                key={i}
                className={`w-0.5 rounded-full transition-all ${
                  isListening
                    ? "bg-red-400 animate-bounce"
                    : isSpeaking
                    ? "bg-[#00FF41] animate-bounce"
                    : "bg-white/20"
                }`}
                style={{
                  height: isListening || isSpeaking ? `${h}px` : "3px",
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
          <span className="text-[9px] font-mono text-[#9499B3] ml-1">
            {isListening ? "INPUT" : isSpeaking ? "SPEAKING" : "IDLE"}
          </span>
        </div>
      </div>

      {/* Center: Live Transcript / Prompt Preview */}
      <div className="flex-1 max-w-md px-3 py-1.5 rounded-xl bg-black/60 border border-white/5 flex items-center gap-2 font-mono text-xs w-full overflow-hidden">
        <Terminal size={12} className="text-[#00F0FF] shrink-0" />
        <span className="text-[#9499B3] truncate">
          {transcript ? (
            <span className="text-white font-bold">{transcript}</span>
          ) : (
            <span className="text-[#4F536E] italic">Say or click a voice directive...</span>
          )}
        </span>
      </div>

      {/* Right: Quick Chips & TTS Toggle */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <div className="hidden md:flex items-center gap-1.5">
          {[
            "Run Security Sentinel",
            "Scan Threat Radar",
            "Synthesize Content",
          ].map((cmd, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleQuickDirective(cmd)}
              className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 hover:border-[#00FF41]/30 hover:text-white text-[10px] font-mono text-[#9499B3] transition-all cursor-pointer"
            >
              ⚡ {cmd.split(" ")[1]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleTts}
          title={ttsEnabled ? "Disable Hermes Voice Feedback" : "Enable Hermes Voice Feedback"}
          className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
            ttsEnabled
              ? "bg-[#00FF41]/10 border-[#00FF41]/30 text-[#00FF41]"
              : "bg-white/5 border-white/10 text-white/40 hover:text-white"
          }`}
        >
          {ttsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>
      </div>
    </div>
  );
}
