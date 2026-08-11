"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegradeButton({ sessionId, label }: { sessionId: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      <button
        className="btn btn-ghost"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          const res = await fetch(`/api/admin/sessions/${sessionId}/regrade`, {
            method: "POST",
          });
          setBusy(false);
          if (res.ok) router.refresh();
          else {
            const d = await res.json().catch(() => ({}));
            setError(d.error ?? "Grading failed.");
          }
        }}
      >
        {busy ? "Grading…" : label}
      </button>
      {error && <span className="text-xs text-bad">{error}</span>}
    </div>
  );
}
