"use client";

/**
 * Voice activity monitoring.
 *
 * The useful question is not "is there sound" — it is "is someone talking who
 * is not the candidate". We answer it by correlating two independent signals:
 * microphone energy in the speech band, and whether the candidate's mouth is
 * actually moving (from the face mesh).
 *
 * Sustained speech-band energy while the candidate's mouth is still means a
 * voice in the room that is not theirs. That covers a person feeding answers, a
 * phone on speaker, and a video playing — all of which are worth a look.
 *
 * What it is not: speaker identification. It cannot tell a helper from a
 * television, and a candidate who mutters with barely-parted lips can produce a
 * false positive. It is weighted as a suspicious signal, not a serious one, and
 * it captures a frame so a human can judge.
 */

/** Speech sits roughly here; ignoring the rest cuts fan and hum noise. */
const SPEECH_MIN_HZ = 300;
const SPEECH_MAX_HZ = 3400;

/** Energy above this in the speech band counts as someone talking. */
const SPEECH_ENERGY_THRESHOLD = 0.055;

/** Above this the mouth is open enough to be speaking. */
const MOUTH_OPEN_THRESHOLD = 0.12;

export type AudioState = {
  /** Normalised 0..1 energy in the speech band. */
  speechEnergy: number;
  /** True when the speech band is above threshold. */
  speaking: boolean;
};

export class VoiceMonitor {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private freq: Uint8Array<ArrayBuffer> | null = null;
  private binHz = 0;

  /** Rolling window of "was the mouth open" samples, newest last. */
  private mouthWindow: boolean[] = [];
  private readonly windowSize = 20; // ~2s at 100ms sampling

  async start(stream: MediaStream): Promise<boolean> {
    try {
      const AudioCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtor) return false;

      this.ctx = new AudioCtor();
      // Autoplay policy can leave the context suspended until a gesture.
      if (this.ctx.state === "suspended") await this.ctx.resume().catch(() => {});

      this.source = this.ctx.createMediaStreamSource(stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.6;
      this.source.connect(this.analyser);

      this.freq = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
      this.binHz = this.ctx.sampleRate / this.analyser.fftSize;
      return true;
    } catch (err) {
      console.error("[proctor] Voice monitor unavailable:", err);
      return false;
    }
  }

  /**
   * "running" once audio is actually flowing. Browsers only honour resume()
   * inside a user gesture, and start() runs from an effect — by which point
   * the gesture has lapsed — so a context can sit "suspended" indefinitely and
   * every sample reads zero. The UI needs to see that rather than showing a
   * dead level meter and blaming the microphone.
   */
  state(): AudioContextState | "unavailable" {
    return this.ctx?.state ?? "unavailable";
  }

  /** Call from inside a click handler to satisfy the gesture requirement. */
  async resume(): Promise<boolean> {
    const ctx = this.ctx;
    if (!ctx) return false;
    if (ctx.state === "running") return true;
    try {
      await ctx.resume();
      return this.state() === "running";
    } catch {
      return false;
    }
  }

  /** Mean normalised magnitude across the speech band. */
  sample(): AudioState {
    if (!this.analyser || !this.freq) return { speechEnergy: 0, speaking: false };

    this.analyser.getByteFrequencyData(this.freq);
    const lo = Math.max(1, Math.floor(SPEECH_MIN_HZ / this.binHz));
    const hi = Math.min(this.freq.length - 1, Math.ceil(SPEECH_MAX_HZ / this.binHz));

    let total = 0;
    for (let i = lo; i <= hi; i++) total += this.freq[i];
    const energy = total / ((hi - lo + 1) * 255);

    return { speechEnergy: energy, speaking: energy > SPEECH_ENERGY_THRESHOLD };
  }

  /**
   * Feed the mouth-open signal from the face mesh on every frame. Kept as a
   * short rolling window so a single dropped frame cannot flip the verdict.
   */
  recordMouth(openness: number): void {
    this.mouthWindow.push(openness > MOUTH_OPEN_THRESHOLD);
    if (this.mouthWindow.length > this.windowSize) this.mouthWindow.shift();
  }

  /** True when the mouth has been essentially still across the whole window. */
  mouthIsStill(): boolean {
    if (this.mouthWindow.length < this.windowSize) return false;
    const openFrames = this.mouthWindow.filter(Boolean).length;
    // Allow a couple of frames of noise before calling it "still".
    return openFrames <= 2;
  }

  /** Discards the window — call when the candidate is expected to speak. */
  resetMouthWindow(): void {
    this.mouthWindow = [];
  }

  stop(): void {
    try {
      this.source?.disconnect();
      this.analyser?.disconnect();
      void this.ctx?.close();
    } catch {
      /* ignore */
    }
    this.ctx = null;
    this.analyser = null;
    this.source = null;
    this.freq = null;
  }
}
