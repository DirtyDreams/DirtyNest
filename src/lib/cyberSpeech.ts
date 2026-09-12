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

  // --- SPEECH RECOGNITION (STT / VOICE INPUT) ---
  private recognitionInstance: any = null;
  private isListening = false;

  public isRecognitionSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  public startListening(options: {
    onTranscript: (text: string, isFinal: boolean) => void;
    onError?: (err: string) => void;
    onEnd?: () => void;
    continuous?: boolean;
  }): boolean {
    if (!this.isRecognitionSupported()) {
      if (options.onError) {
        options.onError("SpeechRecognition is not supported in this browser environment.");
      }
      return false;
    }

    try {
      this.stopListening();

      const SpeechRecognitionClass =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = options.continuous ?? false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        this.isListening = true;
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dirtynest-voice-listening"));
        }
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece;
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        const text = finalTranscript || interimTranscript;
        const isFinal = Boolean(finalTranscript);
        options.onTranscript(text, isFinal);
      };

      recognition.onerror = (event: any) => {
        this.isListening = false;
        if (options.onError) {
          options.onError(event.error || "Speech recognition error");
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dirtynest-voice-stop"));
        }
      };

      recognition.onend = () => {
        this.isListening = false;
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dirtynest-voice-stop"));
        }
        if (options.onEnd) {
          options.onEnd();
        }
      };

      this.recognitionInstance = recognition;
      recognition.start();
      return true;
    } catch (e: any) {
      this.isListening = false;
      if (options.onError) {
        options.onError(e.message || String(e));
      }
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch {
        // ignore if already stopped
      }
      this.recognitionInstance = null;
    }
    this.isListening = false;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dirtynest-voice-stop"));
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const cyberSpeech = new CyberSpeechEngine();

