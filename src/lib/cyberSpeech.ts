"use client";

export interface AgentVoiceProfile {
  id: string;
  name: string;
  role: string;
  pitch: number;
  rate: number;
  color: string;
  avatar: string;
}

export const AGENT_VOICE_PROFILES: AgentVoiceProfile[] = [
  {
    id: "tech-lead",
    name: "TECH-LEAD-01",
    role: "Core Engineering Lead (Claude 3.7)",
    pitch: 1.0,
    rate: 1.05,
    color: "#00FF41",
    avatar: "⚡",
  },
  {
    id: "sentinel-lead",
    name: "SENTINEL-LEAD",
    role: "Zero-Trust AppSec Operative (Nous-Hermes-3)",
    pitch: 0.75,
    rate: 1.15,
    color: "#FF2A6D",
    avatar: "🛡️",
  },
  {
    id: "kube-commander",
    name: "KUBE-COMMANDER",
    role: "Autonomous SRE Commander (OpenAI Codex)",
    pitch: 1.2,
    rate: 0.95,
    color: "#00F0FF",
    avatar: "🐳",
  },
  {
    id: "embed-indexer",
    name: "EMBED-INDEXER",
    role: "HNSW Vector Graph Specialist",
    pitch: 1.1,
    rate: 1.2,
    color: "#BF40FF",
    avatar: "🧠",
  },
  {
    id: "cyber-core",
    name: "DIRTYNEST AI CORE",
    role: "Platform Master Cyber-Intelligence",
    pitch: 1.0,
    rate: 1.0,
    color: "#FFB800",
    avatar: "💬",
  },
];

class CyberSpeechEngine {
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  public speak(
    text: string,
    profile?: Partial<AgentVoiceProfile>,
    onEnd?: () => void
  ): boolean {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return false;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = profile?.pitch ?? 1.0;
      utterance.rate = profile?.rate ?? 1.0;
      utterance.volume = 1.0;

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find((v) => v.lang.startsWith("en") && v.name.includes("Natural")) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      this.isSpeaking = true;
      this.currentUtterance = utterance;

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("dirtynest-speech-start", {
            detail: { text, profile },
          })
        );
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dirtynest-speech-end"));
        }
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dirtynest-speech-end"));
        }
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  }

  public stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      window.dispatchEvent(new CustomEvent("dirtynest-speech-end"));
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const cyberSpeech = new CyberSpeechEngine();
