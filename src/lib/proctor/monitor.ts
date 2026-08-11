"use client";

import { captureFrame, detect, isLookingAway } from "./face";
import { detectObjects } from "./objects";
import { VoiceMonitor } from "./audio";

export type EventType =
  | "FACE_ABSENT"
  | "MULTIPLE_FACES"
  | "PHONE_DETECTED"
  | "SECOND_PERSON_DETECTED"
  | "BACKGROUND_VOICE"
  | "TRANSCRIPT_EDITED"
  | "GAZE_OFF_SCREEN"
  | "TAB_HIDDEN"
  | "WINDOW_BLUR"
  | "FULLSCREEN_EXIT"
  | "PASTE"
  | "COPY"
  | "CONTEXT_MENU"
  | "MULTI_DISPLAY"
  | "DEVTOOLS_SUSPECTED"
  | "KEYSTROKE_BURST"
  | "MEDIA_STOPPED"
  | "AUDIO_SILENT"
  | "NETWORK_OFFLINE";

type QueuedEvent = {
  type: EventType;
  durationMs: number;
  clientAt: number;
  meta?: Record<string, unknown>;
};

export type MonitorWarning = { type: EventType; message: string; at: number };

type MonitorOptions = {
  token: string;
  sessionId: string;
  /** A getter, not the element: the preview is remounted as the UI changes stage. */
  getVideo: () => HTMLVideoElement | null;
  stream: MediaStream;
  faceModelReady: boolean;
  objectModelReady: boolean;
  onWarning: (w: MonitorWarning) => void;
};

const WARNING_TEXT: Partial<Record<EventType, string>> = {
  FACE_ABSENT: "Your face is not visible. Stay centred in the camera.",
  MULTIPLE_FACES: "More than one person is visible. You must be alone.",
  PHONE_DETECTED: "A phone or tablet is visible. Put it out of shot.",
  SECOND_PERSON_DETECTED: "Someone else is in the room. You must be alone.",
  BACKGROUND_VOICE: "Another voice was heard. You must be alone and unassisted.",
  GAZE_OFF_SCREEN: "Keep your eyes on the screen.",
  TAB_HIDDEN: "Leaving this tab is recorded and reported.",
  WINDOW_BLUR: "Switching windows is recorded and reported.",
  FULLSCREEN_EXIT: "Return to fullscreen to continue.",
  PASTE: "Pasting is disabled and has been recorded.",
  COPY: "Copying from the interview has been recorded.",
  MEDIA_STOPPED: "Your camera or microphone stopped. Restore it now.",
  DEVTOOLS_SUSPECTED: "Developer tools appear to be open.",
  NETWORK_OFFLINE: "You are offline. Your answers are saved when you reconnect.",
};

// How long a condition must persist before it counts. Filters out someone
// glancing at their keyboard or a single dropped frame.
const FACE_ABSENT_MS = 2000;
const MULTI_FACE_MS = 700;
const GAZE_AWAY_MS = 1500;
const PHONE_MS = 1200;
const SECOND_PERSON_MS = 1200;
const BACKGROUND_VOICE_MS = 2500;

const DETECT_INTERVAL_MS = 250;
/** Object detection is heavier than the face mesh, so it runs less often. */
const OBJECT_INTERVAL_MS = 900;
const AUDIO_INTERVAL_MS = 100;
const FLUSH_INTERVAL_MS = 5000;
const FLUSH_AT_QUEUE = 10;

export class ProctorMonitor {
  private opts: MonitorOptions;
  private queue: QueuedEvent[] = [];
  private timers: number[] = [];
  private detachers: Array<() => void> = [];
  private stopped = false;

  private blurSince: number | null = null;
  private hiddenSince: number | null = null;
  private snapshotsSent = 0;
  private lastSnapshotAt = 0;

  constructor(opts: MonitorOptions) {
    this.opts = opts;
  }

  async start(): Promise<void> {
    this.attachPageListeners();
    this.attachMediaListeners();

    if (this.opts.faceModelReady) {
      this.timers.push(
        window.setInterval(() => this.tickFace(), DETECT_INTERVAL_MS) as unknown as number,
      );
    }
    if (this.opts.objectModelReady) {
      this.timers.push(
        window.setInterval(() => this.tickObjects(), OBJECT_INTERVAL_MS) as unknown as number,
      );
    }

    // Voice monitoring needs the face mesh for the mouth signal; without it we
    // would flag the candidate's own speech as a background voice.
    this.voiceReady =
      this.opts.faceModelReady && (await this.voice.start(this.opts.stream));
    if (this.voiceReady) {
      this.timers.push(
        window.setInterval(() => this.tickAudio(), AUDIO_INTERVAL_MS) as unknown as number,
      );
    }

    this.timers.push(
      window.setInterval(() => void this.flush(), FLUSH_INTERVAL_MS) as unknown as number,
    );
    this.timers.push(
      window.setInterval(() => this.checkDevtools(), 3000) as unknown as number,
    );
  }

  private voice = new VoiceMonitor();
  private voiceReady = false;

  /**
   * Called when the candidate is expected to be speaking. Clears the mouth
   * window so their own answer is never mistaken for a background voice.
   */
  setExpectingSpeech(expecting: boolean): void {
    this.expectingSpeech = expecting;
    this.voice.resetMouthWindow();
    this.closeEpisode("BACKGROUND_VOICE");
  }
  private expectingSpeech = false;

  async stop(): Promise<void> {
    for (const t of this.timers) window.clearInterval(t);
    this.timers = [];
    for (const d of this.detachers) d();
    this.detachers = [];

    // Close any episode still open, otherwise a candidate who leaves frame and
    // never returns produces no event at all.
    for (const type of [...this.episodes.keys()]) this.closeEpisode(type);
    this.voice.stop();
    if (this.hiddenSince) this.record("TAB_HIDDEN", Date.now() - this.hiddenSince);
    if (this.blurSince) this.record("WINDOW_BLUR", Date.now() - this.blurSince);

    this.stopped = true;
    await this.flush();
  }

  /** Records an event. Duplicate suppression is the caller's job. */
  record(type: EventType, durationMs = 0, meta?: Record<string, unknown>): void {
    if (this.stopped) return;
    this.queue.push({ type, durationMs: Math.round(durationMs), clientAt: Date.now(), meta });
    const text = WARNING_TEXT[type];
    if (text) this.opts.onWarning({ type, message: text, at: Date.now() });
    if (this.queue.length >= FLUSH_AT_QUEUE) void this.flush();
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, 50);
    try {
      await fetch(`/api/interview/${this.opts.token}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: this.opts.sessionId, events: batch }),
        keepalive: true,
      });
    } catch {
      // Put them back; the next flush retries. Losing evidence to a blip would
      // silently favour the candidate.
      this.queue.unshift(...batch);
    }
  }

  // --- Page-level signals ---------------------------------------------------

  private attachPageListeners(): void {
    const on = <K extends keyof DocumentEventMap>(
      target: Document | Window,
      type: K | string,
      handler: EventListener,
    ) => {
      target.addEventListener(type, handler);
      this.detachers.push(() => target.removeEventListener(type, handler));
    };

    on(document, "visibilitychange", () => {
      if (document.hidden) {
        this.hiddenSince = Date.now();
      } else if (this.hiddenSince) {
        this.record("TAB_HIDDEN", Date.now() - this.hiddenSince);
        this.hiddenSince = null;
      }
    });

    on(window, "blur", () => {
      this.blurSince = Date.now();
    });
    on(window, "focus", () => {
      if (this.blurSince) {
        const ms = Date.now() - this.blurSince;
        // Ignore sub-second focus flickers from the browser's own UI.
        if (ms > 800) this.record("WINDOW_BLUR", ms);
        this.blurSince = null;
      }
    });

    on(document, "fullscreenchange", () => {
      if (!document.fullscreenElement) this.record("FULLSCREEN_EXIT");
    });

    on(document, "copy", () => this.record("COPY"));
    on(document, "contextmenu", (e) => {
      e.preventDefault();
      this.record("CONTEXT_MENU");
    });

    on(window, "offline", () => this.record("NETWORK_OFFLINE"));

    // Screen count. Chrome exposes this without a permission prompt.
    const screenAny = window.screen as Screen & { isExtended?: boolean };
    if (screenAny.isExtended) this.record("MULTI_DISPLAY");
  }

  private attachMediaListeners(): void {
    for (const track of this.opts.stream.getTracks()) {
      const handler = () =>
        this.record("MEDIA_STOPPED", 0, { kind: track.kind, reason: "ended" });
      track.addEventListener("ended", handler);
      this.detachers.push(() => track.removeEventListener("ended", handler));

      const muteHandler = () =>
        this.record("MEDIA_STOPPED", 0, { kind: track.kind, reason: "muted" });
      track.addEventListener("mute", muteHandler);
      this.detachers.push(() => track.removeEventListener("mute", muteHandler));
    }
  }

  /**
   * Heuristic only. A wide gap between outer and inner window size usually means
   * a docked devtools panel. It is trivially defeated by undocking, which is why
   * this is weighted as a signal rather than a verdict.
   */
  private checkDevtools(): void {
    const widthGap = window.outerWidth - window.innerWidth;
    const heightGap = window.outerHeight - window.innerHeight;
    if (widthGap > 200 || heightGap > 250) {
      if (!this.devtoolsFlagged) {
        this.devtoolsFlagged = true;
        this.record("DEVTOOLS_SUSPECTED", 0, { widthGap, heightGap });
      }
    } else {
      this.devtoolsFlagged = false;
    }
  }
  private devtoolsFlagged = false;

  // --- Camera analysis ------------------------------------------------------

  /**
   * Each sustained condition produces exactly one event, written when the
   * episode ends so its duration is the real one. The candidate is warned the
   * moment the threshold is crossed — warning and recording are separate on
   * purpose, otherwise a single look-away would be counted twice.
   */
  private tickFace(): void {
    const video = this.opts.getVideo();
    if (!video) return;
    const state = detect(video, performance.now());
    if (!state) return;

    // Feed the mouth signal to the voice monitor before anything else, so the
    // background-voice check always has a current window to work from.
    if (state.faces >= 1) this.voice.recordMouth(state.mouthOpen);

    this.track("FACE_ABSENT", state.faces === 0, FACE_ABSENT_MS, {
      snapshot: "face_absent",
    });
    this.track("MULTIPLE_FACES", state.faces > 1, MULTI_FACE_MS, {
      snapshot: "multiple_faces",
      meta: { faces: state.faces },
    });
    this.track(
      "GAZE_OFF_SCREEN",
      state.faces === 1 && isLookingAway(state),
      GAZE_AWAY_MS,
      {
        meta: {
          yaw: Number(state.yaw.toFixed(2)),
          pitch: Number(state.pitch.toFixed(2)),
        },
      },
    );
  }

  /** Phones, tablets, and second people the face mesh cannot see. */
  private tickObjects(): void {
    const video = this.opts.getVideo();
    if (!video) return;
    const state = detectObjects(video, performance.now());
    if (!state) return;

    this.track("PHONE_DETECTED", state.phone.present, PHONE_MS, {
      snapshot: "phone",
      meta: { confidence: Number(state.phone.confidence.toFixed(2)) },
    });
    this.track("SECOND_PERSON_DETECTED", state.people > 1, SECOND_PERSON_MS, {
      snapshot: "second_person",
      meta: { people: state.people },
    });
  }

  /**
   * Speech-band energy with the candidate's mouth still. Suppressed whenever
   * the candidate is supposed to be talking, because their own voice would
   * otherwise trip it every time the mesh briefly loses their lips.
   */
  private tickAudio(): void {
    if (!this.voiceReady) return;
    const audio = this.voice.sample();
    const otherVoice =
      !this.expectingSpeech && audio.speaking && this.voice.mouthIsStill();

    this.track("BACKGROUND_VOICE", otherVoice, BACKGROUND_VOICE_MS, {
      snapshot: "background_voice",
      meta: { energy: Number(audio.speechEnergy.toFixed(3)) },
    });
  }

  // Sustained-condition state, keyed by event type.
  private episodes = new Map<
    EventType,
    { since: number; flagged: boolean; meta?: Record<string, unknown> }
  >();

  /**
   * Tracks one sustained condition. The candidate is warned as soon as the
   * threshold is crossed; the event is written when the condition *ends*, so
   * its duration is real and a single episode is counted exactly once.
   */
  private track(
    type: EventType,
    active: boolean,
    thresholdMs: number,
    opts: { snapshot?: string; meta?: Record<string, unknown> } = {},
  ): void {
    const now = Date.now();
    const episode = this.episodes.get(type);

    if (active) {
      if (!episode) {
        this.episodes.set(type, { since: now, flagged: false, meta: opts.meta });
        return;
      }
      episode.meta = opts.meta ?? episode.meta;
      if (!episode.flagged && now - episode.since > thresholdMs) {
        episode.flagged = true;
        this.warn(type);
        if (opts.snapshot) void this.snapshot(opts.snapshot);
      }
      return;
    }

    if (episode) this.closeEpisode(type);
  }

  /** Writes the event for a finished episode, if one crossed its threshold. */
  private closeEpisode(type: EventType, meta?: Record<string, unknown>): void {
    const episode = this.episodes.get(type);
    if (!episode) return;
    if (episode.flagged) {
      this.record(type, Date.now() - episode.since, { ...episode.meta, ...meta });
    }
    this.episodes.delete(type);
  }

  /** Warns the candidate without writing an event. */
  private warn(type: EventType): void {
    const text = WARNING_TEXT[type];
    if (text) this.opts.onWarning({ type, message: text, at: Date.now() });
  }

  /** Uploads one evidence frame, rate-limited so a stuck state cannot flood. */
  private async snapshot(reason: string): Promise<void> {
    if (this.snapshotsSent >= 40) return;
    if (Date.now() - this.lastSnapshotAt < 10_000) return;
    const video = this.opts.getVideo();
    if (!video) return;
    const image = captureFrame(video);
    if (!image) return;
    this.lastSnapshotAt = Date.now();
    this.snapshotsSent += 1;

    // Flush events first so the snapshot attaches to the event that caused it.
    await this.flush();
    try {
      await fetch(`/api/interview/${this.opts.token}/snapshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: this.opts.sessionId, image, reason }),
      });
    } catch {
      /* evidence upload is best-effort */
    }
  }
}
