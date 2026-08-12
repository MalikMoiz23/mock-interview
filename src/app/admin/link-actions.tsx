"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  linkId: string;
  candidateName: string;
  status: string;
  sessionCount: number;
  hasResults: boolean;
};

/**
 * Revoke and delete are deliberately different actions.
 *
 * Revoke stops a link being used and keeps everything already recorded — it is
 * what you want when a role is filled. Delete destroys the answers, scores and
 * frames as well, which is what an erasure request needs and what makes it
 * dangerous. Anything with results behind it demands the candidate's name typed
 * out, because a misplaced click should not be able to lose an interview.
 */
export function LinkActions({
  linkId,
  candidateName,
  status,
  sessionCount,
  hasResults,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsTyping = hasResults;
  const canDelete = !needsTyping || confirmText.trim() === candidateName.trim();

  async function revoke() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/links/${linkId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revoke" }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else setError((await res.json().catch(() => ({}))).error ?? "Could not revoke.");
  }

  async function remove() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/links/${linkId}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      setError((await res.json().catch(() => ({}))).error ?? "Could not delete.");
    }
  }

  if (!open) {
    return (
      <div className="flex items-center justify-end gap-3">
        {status === "ACTIVE" && (
          <button
            className="text-xs text-ink-400 hover:text-ink-100"
            onClick={revoke}
            disabled={busy}
            title="Stop this link working. Keeps everything already recorded."
          >
            Revoke
          </button>
        )}
        <button
          className="text-xs text-ink-400 hover:text-bad"
          onClick={() => {
            setOpen(true);
            setConfirmText("");
            setError(null);
          }}
          title="Permanently delete this link and everything recorded against it"
        >
          Delete
        </button>
      </div>
    );
  }

  return (
    <div className="ml-auto w-64 rounded-lg border border-bad/40 bg-bad/5 p-3 text-left">
      <p className="text-xs leading-relaxed text-ink-300">
        Permanently delete <strong>{candidateName}</strong>
        {sessionCount > 0 ? (
          <>
            {" "}
            and {sessionCount} attempt{sessionCount === 1 ? "" : "s"} — answers,
            transcripts, scores, proctoring events and stored frames.
          </>
        ) : (
          <> — the link has never been used.</>
        )}{" "}
        This cannot be undone.
      </p>

      {needsTyping && (
        <input
          className="input mt-2 text-xs"
          placeholder={`Type "${candidateName}" to confirm`}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoFocus
        />
      )}

      {error && <p className="mt-2 text-xs text-bad">{error}</p>}

      <div className="mt-2 flex gap-2">
        <button
          className="btn btn-danger px-3 py-1 text-xs"
          disabled={busy || !canDelete}
          onClick={remove}
        >
          {busy ? "Deleting…" : "Delete permanently"}
        </button>
        <button
          className="btn btn-ghost px-3 py-1 text-xs"
          onClick={() => setOpen(false)}
          disabled={busy}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
