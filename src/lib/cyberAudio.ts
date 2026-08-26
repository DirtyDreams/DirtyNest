"use client";

export type AmbientTrackType = "drone" | "server" | "rain" | "synth";

// Web Audio API ambient audio generator and sound effects engine
class CyberAudioEngine {
  private ctx: AudioContext | null = null;
  private activeNodes: {
    oscillators: OscillatorNode[];
    sources: AudioNode[];
    gainNode: GainNode;
  } | null = null;
  private isPlaying = false;
  private currentTrack: AmbientTrackType = "drone";
  private masterVolume = 0.5;

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

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): AmbientTrackType {
    return this.currentTrack;
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public setVolume(val: number) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.activeNodes && this.ctx) {
      try {
        this.activeNodes.gainNode.gain.setValueAtTime(
          this.masterVolume * 0.05,
          this.ctx.currentTime
        );
      } catch {}
    }
  }

  // Play sound effects
  public play(soundName: string = "click") {
    try {
      if (soundName === "chime" || soundName === "success") {
        this.playChime();
      } else if (soundName === "warp") {
        this.playWarp();
      } else if (soundName === "error") {
        this.playError();
      } else {
        this.playClick();
      }
    } catch {}
  }

  // Toggle ambient focus audio
  public toggleAmbient(track?: AmbientTrackType): boolean {
    this.initContext();
    if (!this.ctx) return false;

    if (track && track !== this.currentTrack && this.isPlaying) {
      this.stopAmbient();
      this.currentTrack = track;
      this.startAmbient(track);
      return true;
    }

    if (this.isPlaying) {
      this.stopAmbient();
      return false;
    } else {
      if (track) this.currentTrack = track;
      this.startAmbient(this.currentTrack);
      return true;
    }
  }

  // Backward compatibility alias for toggleDrone
  public toggleDrone(): boolean {
    return this.toggleAmbient("drone");
  }

  public setTrack(track: AmbientTrackType) {
    this.currentTrack = track;
    if (this.isPlaying) {
      this.stopAmbient();
      this.startAmbient(track);
    }
  }

  private startAmbient(track: AmbientTrackType) {
    if (!this.ctx) return;
    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        this.masterVolume * 0.05,
        this.ctx.currentTime + 1.5
      );

      const oscillators: OscillatorNode[] = [];
      const sources: AudioNode[] = [];

      if (track === "drone") {
        // Deep binaural hum (55Hz and 58Hz for a 3Hz theta wave beat)
        const osc1 = this.ctx.createOscillator();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(55, this.ctx.currentTime);

        const osc2 = this.ctx.createOscillator();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(58, this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(220, this.ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);

        osc1.start();
        osc2.start();
        oscillators.push(osc1, osc2);
      } else if (track === "server") {
        // Server room fan hum (110Hz + 220Hz + white noise filtered)
        const osc1 = this.ctx.createOscillator();
        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(110, this.ctx.currentTime);

        const osc2 = this.ctx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(220, this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(180, this.ctx.currentTime);
        filter.Q.setValueAtTime(3, this.ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);

        osc1.start();
        osc2.start();
        oscillators.push(osc1, osc2);
      } else if (track === "synth") {
        // Deep space synth haze (82.4Hz E2 + 123.4Hz B2)
        const osc1 = this.ctx.createOscillator();
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(82.4, this.ctx.currentTime);

        const osc2 = this.ctx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(123.4, this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);

        osc1.start();
        osc2.start();
        oscillators.push(osc1, osc2);
      } else if (track === "rain") {
        // Cyberpunk pink noise rain
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(650, this.ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gain);
        whiteNoise.start();
        sources.push(whiteNoise);
      }

      gain.connect(this.ctx.destination);
      this.activeNodes = { oscillators, sources, gainNode: gain };
      this.isPlaying = true;
    } catch {}
  }

  private stopAmbient() {
    if (!this.ctx || !this.activeNodes) return;
    try {
      this.activeNodes.gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        this.ctx.currentTime + 0.5
      );
      const current = this.activeNodes;
      setTimeout(() => {
        try {
          current.oscillators.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {}
          });
          current.sources.forEach((src) => {
            try {
              (src as AudioBufferSourceNode).stop();
              src.disconnect();
            } catch {}
          });
          current.gainNode.disconnect();
        } catch {}
      }, 600);
      this.activeNodes = null;
      this.isPlaying = false;
    } catch {}
  }

  // SFX: Crisp mechanical cyber click
  public playClick() {
    this.initContext();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {}
  }

  // SFX: Futuristic focus chime / completion bell
  public playChime() {
    this.initContext();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6 arpeggio

      freqs.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0.0001, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.05, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.65);
      });
    } catch {}
  }

  // SFX: Futuristic warp sound
  private playWarp() {
    this.initContext();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {}
  }

  // SFX: Low error buzzer
  private playError() {
    this.initContext();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.setValueAtTime(120, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {}
  }
}

export const cyberAudio = new CyberAudioEngine();
