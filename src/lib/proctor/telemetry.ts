"use client";

export type Telemetry = {
  keystrokes: number;
  chars: number;
  pastes: number;
  maxBurstCps: number;
  meanIkiMs: number;
  idleMs: number;
  backspaces: number;
};

/**
 * Keystroke telemetry for typed answers.
 *
 * The useful signal is the *shape* of typing, not its speed. A human writing
 * code produces uneven inter-key gaps, backspaces, and pauses. Text that
 * appears with almost no keystrokes behind it, or in a burst faster than any
 * human sustains, was not typed there. Both are reported as observations to the
 * reviewer — neither is proof, and neither changes the competence score.
 */
export class KeystrokeTracker {
  private keystrokes = 0;
  private backspaces = 0;
  private pastes = 0;
  private timestamps: number[] = [];
  private lastKeyAt = 0;
  private idleMs = 0;

  onKeyDown(key: string): void {
    const now = performance.now();
    if (this.lastKeyAt > 0) {
      const gap = now - this.lastKeyAt;
      // Gaps over 5s are thinking time, not typing rhythm.
      if (gap > 5000) this.idleMs += gap;
    }
    this.lastKeyAt = now;
    this.keystrokes += 1;
    if (key === "Backspace" || key === "Delete") this.backspaces += 1;
    this.timestamps.push(now);
    // Bound memory on very long answers.
    if (this.timestamps.length > 20_000) this.timestamps.splice(0, 10_000);
  }

  onPaste(): void {
    this.pastes += 1;
  }

  /** Peak characters typed within any rolling 1-second window. */
  private peakCps(): number {
    if (this.timestamps.length < 2) return 0;
    let best = 0;
    let start = 0;
    for (let end = 0; end < this.timestamps.length; end++) {
      while (this.timestamps[end] - this.timestamps[start] > 1000) start++;
      best = Math.max(best, end - start + 1);
    }
    return best;
  }

  private meanIki(): number {
    if (this.timestamps.length < 2) return 0;
    let total = 0;
    let count = 0;
    for (let i = 1; i < this.timestamps.length; i++) {
      const gap = this.timestamps[i] - this.timestamps[i - 1];
      if (gap < 5000) {
        total += gap;
        count += 1;
      }
    }
    return count ? total / count : 0;
  }

  snapshot(text: string): Telemetry {
    return {
      keystrokes: this.keystrokes,
      chars: text.length,
      pastes: this.pastes,
      maxBurstCps: this.peakCps(),
      meanIkiMs: this.meanIki(),
      idleMs: Math.round(this.idleMs),
      backspaces: this.backspaces,
    };
  }

  reset(): void {
    this.keystrokes = 0;
    this.backspaces = 0;
    this.pastes = 0;
    this.timestamps = [];
    this.lastKeyAt = 0;
    this.idleMs = 0;
  }
}
