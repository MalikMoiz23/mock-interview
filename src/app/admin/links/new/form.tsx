"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DIFFICULTY_PRESETS,
  QUESTION_TYPES,
  QUESTION_TYPE_META,
  blueprintTotal,
  estimatedSeconds,
  type Blueprint,
} from "@/lib/blueprint";
import { planSections } from "@/lib/sections";

type Domain = { id: string; name: string; blurb: string };

type Coverage = {
  curated: number;
  requested: number;
  substitutes: number;
  generatedAreSynthetic: boolean;
};

const DIFFICULTIES = Object.keys(DIFFICULTY_PRESETS);

export function NewLinkForm({ domains }: { domains: Domain[] }) {
  const [domainId, setDomainId] = useState(domains[0]?.id ?? "");
  const [difficulty, setDifficulty] = useState("MID");
  const [blueprint, setBlueprint] = useState<Blueprint>(
    DIFFICULTY_PRESETS.MID.blueprint,
  );
  const [durationMinutes, setDurationMinutes] = useState(
    DIFFICULTY_PRESETS.MID.durationMinutes,
  );
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [customised, setCustomised] = useState(false);

  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [result, setResult] = useState<{ url: string; expiresAt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const domain = domains.find((d) => d.id === domainId);
  const total = blueprintTotal(blueprint);
  const estimatedMin = Math.round(estimatedSeconds(blueprint) / 60);
  const sections = planSections(blueprint);
  const tooTight = estimatedMin > durationMinutes;

  /** Switching seniority re-applies the preset unless the user has hand-tuned it. */
  function applyDifficulty(next: string) {
    setDifficulty(next);
    if (!customised) {
      setBlueprint(DIFFICULTY_PRESETS[next].blueprint);
      setDurationMinutes(DIFFICULTY_PRESETS[next].durationMinutes);
    }
  }

  function setCount(type: keyof Blueprint, value: number) {
    setCustomised(true);
    setBlueprint({ ...blueprint, [type]: Math.max(0, Math.min(20, value)) });
  }

  // Show the recruiter how much of this paper is vetted before they send it.
  useEffect(() => {
    if (!domainId || total === 0) {
      setCoverage(null);
      return;
    }
    let cancelled = false;
    const id = window.setTimeout(async () => {
      const res = await fetch("/api/admin/coverage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId, difficulty, blueprint }),
      });
      if (!res.ok || cancelled) return;
      setCoverage(await res.json());
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [domainId, difficulty, blueprint, total]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domainId,
        candidateName,
        candidateEmail,
        difficulty,
        blueprint,
        durationMinutes,
        expiresInDays,
        maxAttempts,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not create the link.");
      return;
    }
    setResult({ url: data.url, expiresAt: data.link.expiresAt });
  }

  if (result) {
    const mailto = `mailto:${encodeURIComponent(candidateEmail)}?subject=${encodeURIComponent(
      `${domain?.name ?? "Technical"} interview`,
    )}&body=${encodeURIComponent(
      `Hi ${candidateName},\n\nHere is your interview link:\n\n${result.url}\n\nIt takes about ${durationMinutes} minutes and must be completed in one sitting. Use Chrome or Edge on a laptop or desktop, in a quiet room where you are alone. Your camera and microphone must be on.\n\nThe link expires on ${new Date(result.expiresAt).toLocaleDateString()}.\n\nGood luck.`,
    )}`;

    return (
      <div className="card mt-6 p-6">
        <h2 className="font-semibold">Link created</h2>
        <p className="mt-1 text-sm text-ink-400">
          Copy it now — it is not stored in readable form and cannot be shown again.
        </p>
        <div className="mt-4 flex gap-2">
          <input className="input mono text-xs" readOnly value={result.url} />
          <button
            className="btn btn-ghost shrink-0"
            onClick={async () => {
              await navigator.clipboard.writeText(result.url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-400">
          Expires {new Date(result.expiresAt).toLocaleString()}.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a className="btn btn-primary" href={mailto}>
            Email it to {candidateName || "the candidate"}
          </a>
          <Link href="/admin" className="btn btn-ghost">
            Back to interviews
          </Link>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setResult(null);
              setCandidateName("");
              setCandidateEmail("");
            }}
          >
            Create another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-5 lg:grid-cols-[1fr_20rem]">
      <div className="card p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="domainId">
              Field
            </label>
            <select
              id="domainId"
              className="input"
              value={domainId}
              onChange={(e) => setDomainId(e.target.value)}
            >
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {domain && <p className="mt-1 text-xs text-ink-400">{domain.blurb}</p>}
          </div>

          <div>
            <label className="label" htmlFor="candidateName">
              Candidate name
            </label>
            <input
              id="candidateName"
              className="input"
              required
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="candidateEmail">
              Candidate email
            </label>
            <input
              id="candidateEmail"
              className="input"
              type="email"
              required
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="difficulty">
              Level
            </label>
            <select
              id="difficulty"
              className="input"
              value={difficulty}
              onChange={(e) => applyDifficulty(e.target.value)}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {DIFFICULTY_PRESETS[d].label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ink-400">
              {DIFFICULTY_PRESETS[difficulty].hint}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-ink-700 pt-5">
          <div className="flex items-center justify-between">
            <div className="label mb-0">Paper composition</div>
            {customised && (
              <button
                type="button"
                className="text-xs text-accent hover:underline"
                onClick={() => {
                  setCustomised(false);
                  setBlueprint(DIFFICULTY_PRESETS[difficulty].blueprint);
                  setDurationMinutes(DIFFICULTY_PRESETS[difficulty].durationMinutes);
                }}
              >
                Reset to {difficulty.toLowerCase()} default
              </button>
            )}
          </div>

          <p className="mt-1 mb-3 text-xs text-ink-400">
            Each type with at least one question becomes its own section, in the order
            below. Candidates move freely inside a section but cannot return to one they
            have submitted.
          </p>

          <div className="space-y-2">
            {QUESTION_TYPES.map((type) => {
              const meta = QUESTION_TYPE_META[type];
              const count = blueprint[type];
              const sectionNo =
                count > 0
                  ? QUESTION_TYPES.filter(
                      (t, i) =>
                        blueprint[t] > 0 && i <= QUESTION_TYPES.indexOf(type),
                    ).length
                  : null;

              return (
                <div
                  key={type}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors"
                  style={{
                    borderColor: count > 0 ? "var(--color-ink-600)" : "var(--color-ink-700)",
                    background: count > 0 ? "var(--color-ink-800)" : "var(--color-ink-850)",
                  }}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: count > 0 ? meta.colorVar : "var(--color-ink-600)" }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{meta.label}</span>
                      {sectionNo !== null && (
                        <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-ink-400">
                          Section {sectionNo}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-ink-400">{meta.blurb}</div>
                  </div>

                  {/* Stepper: faster than a number input and impossible to fat-finger. */}
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      className="h-8 w-8 rounded-md border border-ink-600 text-ink-300 hover:border-ink-400 disabled:opacity-30"
                      onClick={() => setCount(type, count - 1)}
                      disabled={count === 0}
                      aria-label={`One fewer ${meta.label}`}
                    >
                      −
                    </button>
                    <input
                      className="input w-14 px-1 text-center"
                      type="number"
                      min={0}
                      max={20}
                      aria-label={`${meta.label} count`}
                      value={count}
                      onChange={(e) => setCount(type, Number(e.target.value))}
                    />
                    <button
                      type="button"
                      className="h-8 w-8 rounded-md border border-ink-600 text-ink-300 hover:border-ink-400 disabled:opacity-30"
                      onClick={() => setCount(type, count + 1)}
                      disabled={count >= 20}
                      aria-label={`One more ${meta.label}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-5 border-t border-ink-700 pt-5 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="durationMinutes">
              Total time (min)
            </label>
            <input
              id="durationMinutes"
              className="input"
              type="number"
              min={5}
              max={180}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label" htmlFor="expiresInDays">
              Valid for (days)
            </label>
            <input
              id="expiresInDays"
              className="input"
              type="number"
              min={1}
              max={30}
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label" htmlFor="maxAttempts">
              Attempts
            </label>
            <input
              id="maxAttempts"
              className="input"
              type="number"
              min={1}
              max={3}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number(e.target.value))}
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-bad" role="alert">
            {error}
          </p>
        )}

        <button
          className="btn btn-primary mt-6"
          disabled={busy || !domainId || total === 0}
        >
          {busy ? "Generating…" : "Generate link"}
        </button>
      </div>

      {/* ---- Live summary ---- */}
      <aside className="card h-fit p-5 lg:sticky lg:top-6">
        <div className="label">This paper</div>
        <div className="text-3xl font-bold">
          {total}
          <span className="ml-1 text-base font-normal text-ink-400">
            question{total === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-4 space-y-1 text-xs">
          <Row label="Sections" value={String(sections.length)} />
          <Row label="Time allowed" value={`${durationMinutes} min`} />
          <Row
            label="Realistic time needed"
            value={`~${estimatedMin} min`}
            warn={tooTight}
          />
        </div>

        {sections.length > 0 && (
          <ol className="mt-4 space-y-1 border-t border-ink-700 pt-3 text-xs">
            {sections.map((s) => (
              <li key={s.index} className="flex justify-between gap-2">
                <span className="text-ink-300">
                  {s.index + 1}. {s.title}
                </span>
                <span className="text-ink-400">
                  {s.count} {s.count === 1 ? "question" : "questions"}
                </span>
              </li>
            ))}
          </ol>
        )}

        {tooTight && (
          <p className="mt-3 rounded-md border border-warn/40 bg-warn/10 p-2 text-xs text-warn">
            This paper needs roughly {estimatedMin} minutes but allows{" "}
            {durationMinutes}. Candidates will run out of time — raise the limit or cut
            questions.
          </p>
        )}

        {total === 0 && (
          <p className="mt-3 text-xs text-bad">
            Add at least one question before generating a link.
          </p>
        )}

        {coverage && total > 0 && (
          <div className="mt-5 border-t border-ink-700 pt-4">
            <div className="label">Question source</div>
            <div className="text-xs text-ink-300">
              <strong className="text-ink-100">
                {coverage.curated + coverage.substitutes}
              </strong>{" "}
              of {coverage.requested} from the vetted bank
              {coverage.substitutes > 0 && (
                <span className="text-ink-400">
                  {" "}
                  ({coverage.substitutes} substituted from another type)
                </span>
              )}
            </div>
            {coverage.requested > coverage.curated + coverage.substitutes && (
              <p
                className="mt-2 text-xs"
                style={{
                  color: coverage.generatedAreSynthetic
                    ? "var(--color-warn)"
                    : "var(--color-ink-400)",
                }}
              >
                {coverage.requested - coverage.curated - coverage.substitutes} will be
                generated at interview time.{" "}
                {coverage.generatedAreSynthetic
                  ? "You are running the offline mock provider, so these are generic placeholders — reduce the count or add an ANTHROPIC_API_KEY."
                  : "These are written live by the model for this candidate."}
              </p>
            )}
          </div>
        )}

        <p className="mt-5 border-t border-ink-700 pt-4 text-xs leading-relaxed text-ink-400">
          Multiple choice is graded by exact match and never sent to a model. Everything
          else is scored against a rubric and should be read before you decide.
        </p>
      </aside>
    </form>
  );
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-400">{label}</span>
      <span style={{ color: warn ? "var(--color-warn)" : "var(--color-ink-300)" }}>
        {value}
      </span>
    </div>
  );
}
