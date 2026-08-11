"use client";

/**
 * Speech-to-text via the browser's Web Speech API.
 *
 * Zero-key and instant, but two caveats the candidate is told about up front:
 * it only exists in Chrome and Edge, and in Chrome the audio is transcribed by
 * Google's servers rather than on-device. Swap this module for a server-side
 * provider (Deepgram, Whisper) when you want a single vendor and full control —
 * the surface below is deliberately small.
 */

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<
    ArrayLike<{ transcript: string }> & { isFinal: boolean }
  >;
};

function getConstructor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as
    | (new () => SpeechRecognitionLike)
    | null;
}

export function isSttSupported(): boolean {
  return getConstructor() !== null;
}

/**
 * Errors dictation cannot recover from by restarting.
 * `network` fires when the recogniser cannot reach its speech service — which
 * is every request on an air-gapped deployment, and any connection drop online.
 */
const FATAL_ERRORS = new Set([
  "network",
  "not-allowed",
  "service-not-allowed",
  "audio-capture",
]);

export class Transcriber {
  private recognition: SpeechRecognitionLike | null = null;
  private running = false;
  private finalText = "";
  private interimText = "";
  private speechStartedAt: number | null = null;
  private spokenMs = 0;

  /** Set when dictation has failed unrecoverably; caller should fall back. */
  private fatal: string | null = null;

  constructor(
    private onUpdate: (finalText: string, interimText: string) => void,
    private onError?: (message: string, fatal: boolean) => void,
  ) {}

  /** The unrecoverable error, if dictation has died. */
  getFatalError(): string | null {
    return this.fatal;
  }

  start(): boolean {
    const Ctor = getConstructor();
    if (!Ctor) return false;

    this.recognition = new Ctor();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = navigator.language || "en-US";

    this.recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) this.finalText += text + " ";
        else interim += text;
      }
      this.interimText = interim;
      this.onUpdate(this.finalText.trim(), this.interimText.trim());
    };

    this.recognition.onspeechstart = () => {
      this.speechStartedAt = Date.now();
    };
    this.recognition.onspeechend = () => {
      if (this.speechStartedAt) {
        this.spokenMs += Date.now() - this.speechStartedAt;
        this.speechStartedAt = null;
      }
    };

    this.recognition.onerror = (e) => {
      // `no-speech` and `aborted` are routine; anything else is worth surfacing.
      if (e.error === "no-speech" || e.error === "aborted") return;

      // These cannot recover on their own. `network` is the important one:
      // Chrome transcribes on Google's servers, so a dropped connection — or an
      // offline deployment — kills dictation permanently. Stop restarting and
      // tell the caller so it can fall back to typing, rather than leaving the
      // candidate staring at "Listening…" with nothing appearing.
      if (FATAL_ERRORS.has(e.error)) {
        this.running = false;
        this.fatal = e.error;
      }
      this.onError?.(e.error, this.fatal !== null);
    };

    // Chrome ends the session after a silence window; restart while recording.
    this.recognition.onend = () => {
      if (this.running) {
        try {
          this.recognition?.start();
        } catch {
          /* already starting */
        }
      }
    };

    this.running = true;
    try {
      this.recognition.start();
      return true;
    } catch {
      this.running = false;
      return false;
    }
  }

  stop(): void {
    this.running = false;
    if (this.speechStartedAt) {
      this.spokenMs += Date.now() - this.speechStartedAt;
      this.speechStartedAt = null;
    }
    try {
      this.recognition?.stop();
    } catch {
      /* ignore */
    }
    this.recognition = null;
  }

  /**
   * Pauses dictation without discarding what has been said, so the candidate
   * can correct a mis-transcribed word and carry on. Speech recognition gets
   * names, jargon and accents wrong often enough that not offering this would
   * mean grading people on the recogniser's mistakes.
   */
  pause(): void {
    this.running = false;
    if (this.speechStartedAt) {
      this.spokenMs += Date.now() - this.speechStartedAt;
      this.speechStartedAt = null;
    }
    // Fold any in-flight interim text into the final text so an edit does not
    // fight with a partial result landing a moment later.
    if (this.interimText.trim()) {
      this.finalText = `${this.finalText} ${this.interimText}`.trim() + " ";
      this.interimText = "";
    }
    try {
      this.recognition?.stop();
    } catch {
      /* ignore */
    }
  }

  resume(): boolean {
    if (this.running) return true;
    // The recogniser instance is not reliably restartable after stop() in
    // every browser, so build a fresh one and keep the accumulated text.
    const carried = this.finalText;
    const spoken = this.spokenMs;
    this.recognition = null;
    const started = this.start();
    this.finalText = carried;
    this.spokenMs = spoken;
    return started;
  }

  isRunning(): boolean {
    return this.running;
  }

  /** Replaces the transcript with the candidate's corrected version. */
  setText(text: string): void {
    this.finalText = text.trim() ? text.trim() + " " : "";
    this.interimText = "";
  }

  /** Final transcript with any trailing interim fragment appended. */
  getTranscript(): string {
    return `${this.finalText} ${this.interimText}`.replace(/\s+/g, " ").trim();
  }

  getSpokenMs(): number {
    return this.spokenMs + (this.speechStartedAt ? Date.now() - this.speechStartedAt : 0);
  }

  reset(): void {
    this.finalText = "";
    this.interimText = "";
    this.spokenMs = 0;
    this.speechStartedAt = null;
  }
}
