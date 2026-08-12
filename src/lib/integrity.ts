import type { EventType } from "@prisma/client";

/**
 * Integrity scoring.
 *
 * This produces a *risk* signal, not a verdict. A score of 100 means "nothing
 * this browser can observe looked unusual" — it is not evidence the candidate
 * did not cheat. A candidate reading questions off a second device and typing
 * an LLM answer on a phone produces zero events here. Treat a low score as a
 * reason to watch the recording and probe in the onsite; treat a high score as
 * the absence of evidence, not evidence of absence.
 */

type Rule = {
  /** Points deducted per occurrence. */
  penalty: number;
  /** Maximum total deduction from this event type. */
  cap: number;
  /** Displayed severity: 1 informational, 2 suspicious, 3 serious. */
  severity: 1 | 2 | 3;
  label: (count: number, totalMs: number) => string;
};

export const EVENT_RULES: Record<EventType, Rule> = {
  PHONE_DETECTED: {
    penalty: 20,
    cap: 60,
    severity: 3,
    label: (n, ms) =>
      `A phone or tablet was visible ${n} time(s), ${Math.round(ms / 1000)}s total`,
  },
  SECOND_PERSON_DETECTED: {
    penalty: 18,
    cap: 54,
    severity: 3,
    label: (n, ms) =>
      `A second person was in frame ${n} time(s), ${Math.round(ms / 1000)}s total`,
  },
  MULTIPLE_FACES: {
    penalty: 15,
    cap: 45,
    severity: 3,
    label: (n) => `${n} moment(s) with more than one face in frame`,
  },
  BACKGROUND_VOICE: {
    penalty: 9,
    cap: 36,
    severity: 2,
    label: (n, ms) =>
      `Speech heard while the candidate's mouth was still: ${n} time(s), ${Math.round(ms / 1000)}s total`,
  },
  TRANSCRIPT_EDITED: {
    // Zero penalty on purpose. Speech recognition is unreliable and candidates
    // are told they may correct it; punishing that would penalise an accent.
    penalty: 0,
    cap: 0,
    severity: 1,
    label: (n) => `Transcript hand-corrected on ${n} answer(s) — permitted`,
  },
  MEDIA_STOPPED: {
    penalty: 15,
    cap: 45,
    severity: 3,
    label: (n) => `Camera or microphone stopped ${n} time(s) mid-interview`,
  },
  DEVTOOLS_SUSPECTED: {
    penalty: 15,
    cap: 30,
    severity: 3,
    label: (n) => `Developer tools suspected open (${n} detection(s))`,
  },
  PASTE: {
    penalty: 12,
    cap: 36,
    severity: 3,
    label: (n) => `${n} paste event(s) into an answer field`,
  },
  TAB_HIDDEN: {
    penalty: 10,
    cap: 40,
    severity: 3,
    label: (n, ms) =>
      `Left the interview tab ${n} time(s), ${Math.round(ms / 1000)}s total away`,
  },
  KEYSTROKE_BURST: {
    penalty: 10,
    cap: 30,
    severity: 3,
    label: (n) => `${n} typing burst(s) faster than human sustained typing`,
  },
  MULTI_DISPLAY: {
    penalty: 8,
    cap: 8,
    severity: 2,
    label: () => `More than one display attached`,
  },
  ANSWER_PACING_ANOMALY: {
    penalty: 8,
    cap: 24,
    severity: 2,
    label: (n) => `${n} answer(s) with long silence followed by fluent delivery`,
  },
  FACE_ABSENT: {
    penalty: 6,
    cap: 30,
    severity: 3,
    label: (n, ms) => `Face out of frame ${n} time(s), ${Math.round(ms / 1000)}s total`,
  },
  FULLSCREEN_EXIT: {
    penalty: 5,
    cap: 15,
    severity: 2,
    label: (n) => `Exited fullscreen ${n} time(s)`,
  },
  COPY: {
    penalty: 5,
    cap: 15,
    severity: 2,
    label: (n) => `Copied content out of the interview ${n} time(s)`,
  },
  WINDOW_BLUR: {
    penalty: 4,
    cap: 20,
    severity: 2,
    label: (n, ms) =>
      `Window lost focus ${n} time(s), ${Math.round(ms / 1000)}s total`,
  },
  GAZE_OFF_SCREEN: {
    penalty: 2,
    cap: 20,
    severity: 2,
    label: (n, ms) =>
      `Looked away from the screen ${n} time(s), ${Math.round(ms / 1000)}s total`,
  },
  AUDIO_SILENT: {
    penalty: 2,
    cap: 10,
    severity: 1,
    label: (n) => `Microphone produced no detectable sound (${n} occurrence(s))`,
  },
  NETWORK_OFFLINE: {
    penalty: 2,
    cap: 10,
    severity: 1,
    label: (n) => `Network dropped ${n} time(s)`,
  },
  CONTEXT_MENU: {
    penalty: 1,
    cap: 5,
    severity: 1,
    label: (n) => `Opened the context menu ${n} time(s)`,
  },
  MODEL_UNAVAILABLE: {
    penalty: 0,
    cap: 0,
    severity: 1,
    label: () => `Face detection model failed to load — visual monitoring was off`,
  },
};

export type IntegrityFlag = {
  type: EventType;
  severity: 1 | 2 | 3;
  count: number;
  totalMs: number;
  deduction: number;
  message: string;
};

export type IntegrityResult = {
  score: number;
  flags: IntegrityFlag[];
  /** "full" when both face and speech monitoring were active for the session. */
  coverage: "full" | "partial" | "minimal";
  coverageNote: string;
};

export function computeIntegrity(
  events: Array<{ type: EventType; durationMs: number }>,
  opts: { faceModelLoaded: boolean; sttAvailable: boolean; objectModelLoaded?: boolean },
): IntegrityResult {
  const grouped = new Map<EventType, { count: number; totalMs: number }>();
  for (const e of events) {
    const g = grouped.get(e.type) ?? { count: 0, totalMs: 0 };
    g.count += 1;
    g.totalMs += e.durationMs ?? 0;
    grouped.set(e.type, g);
  }

  const flags: IntegrityFlag[] = [];
  let deducted = 0;

  for (const [type, g] of grouped) {
    const rule = EVENT_RULES[type];
    if (!rule) continue;
    const deduction = Math.min(g.count * rule.penalty, rule.cap);
    deducted += deduction;
    flags.push({
      type,
      severity: rule.severity,
      count: g.count,
      totalMs: g.totalMs,
      deduction,
      message: rule.label(g.count, g.totalMs),
    });
  }

  flags.sort((a, b) => b.deduction - a.deduction || b.severity - a.severity);

  let coverage: IntegrityResult["coverage"] = "full";
  const gaps: string[] = [];
  if (!opts.faceModelLoaded) {
    gaps.push("face detection did not run");
    coverage = "minimal";
  }
  if (opts.objectModelLoaded === false) {
    gaps.push("phone and second-person detection did not run");
    coverage = coverage === "minimal" ? "minimal" : "partial";
  }
  if (!opts.sttAvailable) {
    gaps.push("speech recognition was unavailable in the candidate's browser");
    coverage = coverage === "minimal" ? "minimal" : "partial";
  }

  return {
    score: Math.max(0, Math.min(100, 100 - deducted)),
    flags,
    coverage,
    coverageNote:
      gaps.length === 0
        ? "Camera, microphone and browser-focus monitoring were all active."
        : `Reduced monitoring: ${gaps.join("; ")}. Interpret this score with caution.`,
  };
}

/** Integrity risk bands used in the admin UI. */
export function integrityBand(score: number): "clear" | "watch" | "review" {
  if (score >= 80) return "clear";
  if (score >= 50) return "watch";
  return "review";
}

/**
 * Whether this result should go to a human before any hiring decision.
 *
 * Score alone is not enough. The per-type caps mean several *different*
 * serious signals can each land under their cap and still leave a passable
 * score — a phone in frame, a second person, and a voice in the room together
 * came to 53/100 in testing, which would otherwise have read as a clean pass.
 * Independent serious signals corroborate each other, so two distinct ones
 * route to review regardless of the arithmetic.
 */
export function needsHumanReview(result: IntegrityResult): boolean {
  if (result.score < 50) return true;
  const seriousTypes = result.flags.filter((f) => f.severity === 3 && f.deduction > 0);
  return seriousTypes.length >= 2;
}
