import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cyberSpeech } from "./cyberSpeech";

describe("CyberSpeechEngine", () => {
  beforeEach(() => {
    const mockUtterance = vi.fn().mockImplementation(function (this: any, text: string) {
      this.text = text;
      this.pitch = 1.0;
      this.rate = 1.0;
      this.volume = 1.0;
    });

    vi.stubGlobal("SpeechSynthesisUtterance", mockUtterance);
    (window as any).SpeechSynthesisUtterance = mockUtterance;

    (window as any).speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn().mockReturnValue([
        { name: "Microsoft David", lang: "en-US" },
      ]),
    };

    window.dispatchEvent = vi.fn();
  });

  afterEach(() => {
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
    vi.restoreAllMocks();
  });

  it("speaks text using SpeechSynthesisUtterance", () => {
    const success = cyberSpeech.speak("Test voice synthesis", { pitch: 1.1, rate: 1.0 });
    expect(success).toBe(true);
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it("stops speech synthesis", () => {
    cyberSpeech.stop();
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(cyberSpeech.getIsSpeaking()).toBe(false);
  });

  it("handles speech recognition availability check", () => {
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
    expect(cyberSpeech.isRecognitionSupported()).toBe(false);

    // Mock webkitSpeechRecognition on window
    const mockRecognition = vi.fn().mockImplementation(function (this: any) {
      this.start = vi.fn();
      this.stop = vi.fn();
    });

    (window as any).webkitSpeechRecognition = mockRecognition;
    expect(cyberSpeech.isRecognitionSupported()).toBe(true);
  });
});
