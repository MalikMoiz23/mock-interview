"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PurgeMediaButton({ sessionId, count }: { sessionId: string; count: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      className="btn btn-danger text-xs"
      disabled={busy || count === 0}
      onClick={async () => {
        if (
          !confirm(
            `Permanently delete all ${count} stored frames for this candidate? Scores and transcripts are kept. This cannot be undone.`,
          )
        )
          return;
        setBusy(true);
        await fetch(`/api/admin/sessions/${sessionId}/media`, { method: "DELETE" });
        setBusy(false);
        router.refresh();
      }}
    >
      {busy ? "Deleting…" : `Delete ${count} frame${count === 1 ? "" : "s"}`}
    </button>
  );
}
