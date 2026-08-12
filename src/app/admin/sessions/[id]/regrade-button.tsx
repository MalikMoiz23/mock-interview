"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  sessionId: string;
  label: string;
  /**
   * True when the session is finished but carries no score. Grading normally
   * completes on its own after submission; this covers the case where the
   * server was restarted or crashed mid-run, so opening the result recovers it
   * instead of leaving a recruiter staring at a blank page.
   */
  autoStart?: boolean;
};

export function RegradeButton({ sessionId, label, autoStart = false }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fired = useRef(false);

  const run = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/regrade`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Grading failed.");
      }
    } catch {
      setError("Grading request failed — is the scoring model running?");
    } finally {
      setBusy(false);
    }
  }, [sessionId, router]);

  // Strict Mode double-invokes effects in development; the ref keeps a single
  // grading run from becoming two.
  useEffect(() => {
    if (!autoStart || fired.current) return;
    fired.current = true;
    void run();
  }, [autoStart, run]);

  return (
    <div className="flex items-center gap-3">
      <button className="btn btn-ghost" disabled={busy} onClick={run}>
        {busy ? "Grading…" : label}
      </button>
      {busy && (
        <span className="text-xs text-ink-400">
          A minute or so per written answer.
        </span>
      )}
      {error && <span className="text-xs text-bad">{error}</span>}
    </div>
  );
}
