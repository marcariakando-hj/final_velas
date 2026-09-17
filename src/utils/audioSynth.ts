// Audio synthesizer using Web Audio API for organic wooden wick crackling & warm fire atmosphere

class WoodWickSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private timerId: number | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
  }

  public async start() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    this.isPlaying = true;
    this.scheduleCrackles();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private scheduleCrackles() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    // Trigger crackle pop
    this.playPop();

    // Occasional subtle double crackle
    if (Math.random() > 0.6) {
      setTimeout(() => {
        if (this.isPlaying) this.playPop();
      }, 50 + Math.random() * 80);
    }

    // Next random interval
    const nextInterval = 250 + Math.random() * 650;
    this.timerId = window.setTimeout(() => {
      this.scheduleCrackles();
    }, nextInterval);
  }

  private playPop() {
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;

      // Noise burst buffer
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.04); // 40ms burst
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Filtered noise with exponential decay
      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.exp(-i / (bufferSize * 0.25));
        data[i] = (Math.random() * 2 - 1) * decay * 0.45;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Bandpass filter to mimic wood frequency (900Hz - 2800Hz)
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1100 + Math.random() * 1400, now);
      filter.Q.setValueAtTime(3.5, now);

      const popGain = this.ctx.createGain();
      const popVolume = 0.15 + Math.random() * 0.35;
      popGain.gain.setValueAtTime(popVolume, now);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      noiseSource.connect(filter);
      filter.connect(popGain);
      popGain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + 0.05);
    } catch {
      // Audio fallback silent
    }
  }
}

export const woodSoundEngine = new WoodWickSoundEngine();
