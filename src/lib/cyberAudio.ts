"use client";

// Pure Web Audio API ambient drone and notification sound generator
class CyberAudioEngine {
  private ctx: AudioContext | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  private initContext() {
    try {
      if (!this.ctx && typeof window !== "undefined") {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
    } catch {
      /* ignore audio context restrictions */
    }
  }

  // Generic play method
  public play(soundName: string = "click") {
    try {
      if (soundName === "chime") {
        this.playChime();
      } else {
        this.playClick();
      }
    } catch {
      /* ignore */
    }
  }

  // Toggle ambient focus hum
  public toggleDrone(): boolean {
    try {
      this.initContext();
      if (!this.ctx) return false;

      if (this.isPlaying) {
        this.stopDrone();
        return false;
      } else {
        this.startDrone();
        return true;
      }
    } catch {
      return false;
    }
  }

  private startDrone() {
    if (!this.ctx) return;
    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 2);

      // Deep binaural hum (55Hz and 58Hz for a 3Hz theta wave beat)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = "sine";
      this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = "triangle";
      this.droneOsc2.frequency.setValueAtTime(58, this.ctx.currentTime);

      // Lowpass filter to keep it warm and atmospheric
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      this.droneOsc1.connect(filter);
      this.droneOsc2.connect(filter);
      filter.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.droneOsc1.start();
      this.droneOsc2.start();
      this.isPlaying = true;
    } catch {
      /* ignore */
    }
  }

  private stopDrone() {
    if (!this.ctx || !this.gainNode) return;
    try {
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
      setTimeout(() => {
        try {
          this.droneOsc1?.stop();
          this.droneOsc2?.stop();
          this.droneOsc1?.disconnect();
          this.droneOsc2?.disconnect();
        } catch {
          /* ignore */
        }
        this.isPlaying = false;
      }, 850);
    } catch {
      /* ignore */
    }
  }

  // High-tech terminal click sound
  public playClick() {
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      /* ignore */
    }
  }

  // Pomodoro completion chime
  public playChime() {
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }

      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.12);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.12 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.12);
        osc.stop(this.ctx.currentTime + i * 0.12 + 0.45);
      });
    } catch {
      /* ignore */
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const cyberAudio = new CyberAudioEngine();
