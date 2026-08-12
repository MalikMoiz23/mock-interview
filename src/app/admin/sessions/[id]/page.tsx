import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { integrityBand, type IntegrityResult } from "@/lib/integrity";
import { QUESTION_TYPE_META } from "@/lib/blueprint";
import type { AnswerScore } from "@/lib/ai/types";
import {
  Meter,
  Pill,
  RecommendationPill,
  StatusPill,
  formatDuration,
  integrityColor,
  scoreColor,
} from "@/components/ui";
import { RegradeButton } from "./regrade-button";
import { PurgeMediaButton } from "./purge-media-button";

export const dynamic = "force-dynamic";

const SEVERITY_COLOR = ["", "var(--color-ink-400)", "var(--color-warn)", "var(--color-bad)"];

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  const { id } = await params;

  const session = await db.interviewSession.findFirst({
    where: { id, link: { orgId: user.orgId } },
    include: {
      link: { include: { domain: true } },
      questions: { orderBy: { order: "asc" } },
      events: { orderBy: { at: "asc" } },
      snapshots: { orderBy: { createdAt: "asc" } },
      score: true,
    },
  });
  if (!session) notFound();

  const integrity = session.score
    ? (session.score.integrityFlags as unknown as IntegrityResult)
    : null;
  const dimensions = session.score
    ? (session.score.dimensions as unknown as Record<string, number>)
    : null;
  const strengths = (session.score?.strengths as unknown as string[]) ?? [];
  const concerns = (session.score?.concerns as unknown as string[]) ?? [];

  // The check-in photo is who sat the interview; violation frames are evidence
  // from during it. Mixing them in one gallery buries the reference image.
  const identityPhoto = session.snapshots.find((s) => s.kind === "IDENTITY") ?? null;
  const violationFrames = session.snapshots.filter((s) => s.kind === "VIOLATION");

  const elapsed =
    session.startedAt && session.endedAt
      ? session.endedAt.getTime() - session.startedAt.getTime()
      : null;

  return (
    <>
      <Link href="/admin" className="text-xs text-ink-400 hover:text-ink-100">
        ← All interviews
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {identityPhoto && (
            <a
              href={`/api/admin/snapshots/${identityPhoto.id}`}
              target="_blank"
              rel="noreferrer"
              className="block shrink-0 overflow-hidden rounded-lg border border-ink-700"
              title="Check-in photo, taken before the interview started"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/admin/snapshots/${identityPhoto.id}`}
                alt={`Check-in photo of ${session.link.candidateName}`}
                className="h-20 w-28 object-cover"
              />
            </a>
          )}
          <div>
          <h1 className="text-xl font-semibold">{session.link.candidateName}</h1>
          <p className="mt-1 text-sm text-ink-400">
            {session.link.domain.name} · {session.link.difficulty.toLowerCase()} ·{" "}
            {session.link.candidateEmail}
          </p>
          <p className="mt-1 text-xs text-ink-400">
            {session.startedAt
              ? `Started ${session.startedAt.toLocaleString()}`
              : "Never started"}
            {elapsed !== null && ` · took ${formatDuration(elapsed)}`}
          </p>
          {identityPhoto && (
            <p className="mt-1 text-xs text-ink-400">
              Check-in photo taken at {identityPhoto.createdAt.toLocaleTimeString()} — click to enlarge
            </p>
          )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill value={session.status} />
          {session.status !== "PENDING" && session.status !== "IN_PROGRESS" && (
            <RegradeButton
              sessionId={session.id}
              label={session.score ? "Re-grade" : "Grade now"}
            />
          )}
        </div>
      </div>

      {!session.score && session.status === "SUBMITTED" && (
        <div className="card mt-6 p-4 text-sm text-ink-300">
          Grading has not completed yet. It runs in the background after submission —
          use <strong>Grade now</strong> if it did not finish.
        </div>
      )}

      {/* ---- Score + integrity ------------------------------------------- */}
      {session.score && (
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="label">Competence</div>
                <div
                  className="text-4xl font-bold"
                  style={{ color: scoreColor(session.score.overall) }}
                >
                  {session.score.overall}
                  <span className="text-lg font-normal text-ink-400">/100</span>
                </div>
              </div>
              <RecommendationPill value={session.score.recommendation} />
            </div>

            {dimensions && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {Object.entries(dimensions).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs">
                      <span className="capitalize text-ink-300">
                        {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                      </span>
                      <span className="text-ink-400">{Math.round(value)}</span>
                    </div>
                    <div className="mt-1">
                      <Meter value={value} color={scoreColor(value)} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-5 text-sm leading-relaxed text-ink-300">
              {session.score.rationale}
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <div className="label">Strengths</div>
                <ul className="space-y-1 text-sm text-ink-300">
                  {strengths.length ? (
                    strengths.map((s, i) => <li key={i}>· {s}</li>)
                  ) : (
                    <li className="text-ink-400">None recorded.</li>
                  )}
                </ul>
              </div>
              <div>
                <div className="label">Concerns</div>
                <ul className="space-y-1 text-sm text-ink-300">
                  {concerns.length ? (
                    concerns.map((s, i) => <li key={i}>· {s}</li>)
                  ) : (
                    <li className="text-ink-400">None recorded.</li>
                  )}
                </ul>
              </div>
            </div>

            <p className="mt-5 border-t border-ink-700 pt-3 text-xs text-ink-400">
              Scored by {session.score.provider} / {session.score.model} on{" "}
              {session.score.scoredAt.toLocaleString()}.
              {session.score.provider === "mock" && (
                <>
                  {" "}
                  <strong className="text-warn">
                    The offline scorer measures rubric keyword coverage, not correctness.
                    Read the answers before deciding.
                  </strong>
                </>
              )}
            </p>
          </div>

          <div className="card p-5">
            <div className="label">Integrity</div>
            <div
              className="text-4xl font-bold"
              style={{ color: integrityColor(session.score.integrityScore) }}
            >
              {session.score.integrityScore}
              <span className="text-lg font-normal text-ink-400">/100</span>
            </div>
            <div className="mt-2">
              <Pill color={integrityColor(session.score.integrityScore)}>
                {integrityBand(session.score.integrityScore)}
              </Pill>
            </div>

            {integrity?.coverageNote && (
              <p className="mt-3 text-xs leading-relaxed text-ink-400">
                {integrity.coverageNote}
              </p>
            )}

            <div className="mt-4 space-y-2">
              {integrity?.flags?.length ? (
                integrity.flags.map((f) => (
                  <div key={f.type} className="flex items-start gap-2 text-xs">
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full"
                      style={{ background: SEVERITY_COLOR[f.severity] }}
                    />
                    <span className="text-ink-300">
                      {f.message}
                      <span className="text-ink-400"> (−{f.deduction})</span>
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-ink-400">No anomalies detected.</p>
              )}
            </div>

            <p className="mt-4 border-t border-ink-700 pt-3 text-xs leading-relaxed text-ink-400">
              This measures what the browser could observe. It cannot see a second
              device, a person off-camera out of frame, or a printed cheat sheet.
            </p>
          </div>
        </div>
      )}

      {/* ---- Answers ------------------------------------------------------ */}
      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink-400">
        Answers
      </h2>
      <div className="mt-3 space-y-4">
        {session.questions.map((q) => {
          const result = q.result as unknown as AnswerScore | null;
          const telemetry = q.telemetry as unknown as Record<string, number> | null;
          return (
            <div key={q.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-[16rem]">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill color={QUESTION_TYPE_META[q.type].colorVar}>
                      {QUESTION_TYPE_META[q.type].label}
                    </Pill>
                    <span className="text-xs text-ink-400">
                      Question {q.order + 1} of {session.questions.length}
                    </span>
                    <span className="text-xs text-ink-400">
                      · section {q.sectionIndex + 1}
                    </span>
                    {q.skipped && (
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "var(--color-warn)" }}
                        title="The candidate moved past this question without answering"
                      >
                        · skipped
                      </span>
                    )}
                    {q.transcriptEdited && (
                      <span className="text-xs text-ink-400" title="Permitted — speech recognition is imperfect">
                        · transcript hand-corrected
                      </span>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                    {q.prompt}
                  </p>
                </div>
                {result && (
                  <div className="text-right">
                    <div
                      className="text-2xl font-bold"
                      style={{ color: scoreColor(result.score) }}
                    >
                      {result.score}
                    </div>
                    <div className="text-xs text-ink-400">/100</div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                {q.type === "MCQ" ? (
                  <>
                    <div className="label">Options</div>
                    <div className="space-y-1.5">
                      {((q.options as unknown as string[]) ?? []).map((opt, i) => {
                        const isCorrect = i === q.correctIndex;
                        const isChosen = i === q.selectedIndex;
                        const color = isCorrect
                          ? "var(--color-good)"
                          : isChosen
                            ? "var(--color-bad)"
                            : "var(--color-ink-700)";
                        return (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded-md border p-2 text-sm"
                            style={{
                              borderColor: color,
                              background:
                                isCorrect || isChosen
                                  ? `color-mix(in srgb, ${color} 10%, transparent)`
                                  : "transparent",
                            }}
                          >
                            <span className="mono text-xs text-ink-400">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isChosen && (
                              <span className="text-xs" style={{ color }}>
                                candidate
                              </span>
                            )}
                            {isCorrect && (
                              <span className="text-xs text-good">correct</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {q.selectedIndex === null && (
                      <p className="mt-2 text-sm text-bad">No option selected.</p>
                    )}
                    {q.explanation && (
                      <p className="mt-2 text-xs text-ink-400">{q.explanation}</p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="label">
                      {q.answerMode === "SPOKEN" ? "Transcript" : "Written answer"}
                    </div>
                    {q.answerText.trim() ? (
                      <pre
                        className={`max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-ink-950 p-3 text-xs leading-relaxed text-ink-100 ${
                          q.type === "CODING" ? "mono" : ""
                        }`}
                      >
                        {q.answerText}
                      </pre>
                    ) : (
                      <p className="text-sm text-bad">No answer submitted.</p>
                    )}
                  </>
                )}
              </div>

              {result && (
                <>
                  <p className="mt-3 text-sm text-ink-300">{result.summary}</p>
                  {result.criterionScores.length > 0 && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {result.criterionScores.map((c) => (
                        <div key={c.key}>
                          <div className="flex justify-between text-xs">
                            <span className="text-ink-300">{c.key}</span>
                            <span className="text-ink-400">{c.score}</span>
                          </div>
                          <div className="mt-1">
                            <Meter value={c.score} color={scoreColor(c.score)} />
                          </div>
                          <p className="mt-1 text-xs text-ink-400">{c.note}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-ink-700 pt-3 text-xs text-ink-400">
                {q.answerMode === "SPOKEN" && (
                  <span>Speech detected: {Math.round(q.spokenMs / 1000)}s</span>
                )}
                {telemetry && (
                  <>
                    <span>{telemetry.keystrokes} keystrokes</span>
                    <span
                      className={telemetry.pastes > 0 ? "text-bad font-semibold" : undefined}
                    >
                      {telemetry.pastes} paste{telemetry.pastes === 1 ? "" : "s"}
                    </span>
                    <span>peak {telemetry.maxBurstCps?.toFixed(1)} char/s</span>
                    <span>mean gap {Math.round(telemetry.meanIkiMs)}ms</span>
                  </>
                )}
                {q.servedAt && q.submittedAt && (
                  <span>
                    took{" "}
                    {formatDuration(q.submittedAt.getTime() - q.servedAt.getTime())} of{" "}
                    {Math.round(q.timeLimitSec / 60)}m allowed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- Evidence ----------------------------------------------------- */}
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
            Event timeline
          </h2>
          {session.events.length === 0 ? (
            <p className="mt-3 text-sm text-ink-400">No events recorded.</p>
          ) : (
            <div className="mt-3 max-h-96 space-y-1.5 overflow-auto">
              {session.events.map((e) => (
                <div key={e.id} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: SEVERITY_COLOR[e.severity] ?? "var(--color-ink-400)" }}
                  />
                  <span className="mono text-ink-400">
                    {session.startedAt
                      ? `+${Math.round((e.at.getTime() - session.startedAt.getTime()) / 1000)}s`
                      : e.at.toLocaleTimeString()}
                  </span>
                  <span className="text-ink-300">{e.type.replace(/_/g, " ").toLowerCase()}</span>
                  {e.durationMs > 0 && (
                    <span className="text-ink-400">({Math.round(e.durationMs / 1000)}s)</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
              Flagged frames
            </h2>
            <PurgeMediaButton sessionId={session.id} count={session.snapshots.length} />
          </div>
          {violationFrames.length === 0 ? (
            <p className="mt-3 text-sm text-ink-400">No frames captured.</p>
          ) : (
            <div className="mt-3 grid max-h-96 grid-cols-3 gap-2 overflow-auto">
              {violationFrames.map((s) => (
                <a
                  key={s.id}
                  href={`/api/admin/snapshots/${s.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-md border border-ink-700"
                  title={s.createdAt.toLocaleTimeString()}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/admin/snapshots/${s.id}`}
                    alt={`Frame at ${s.createdAt.toLocaleTimeString()}`}
                    className="aspect-video w-full object-cover"
                  />
                </a>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs leading-relaxed text-ink-400">
            Deleting removes the check-in photo too. Frames are captured only at flagged moments and are visible to signed-in
            recruiters in your organisation. Delete them once the hiring decision is
            made — they are biometric data in several jurisdictions.
          </p>
        </div>
      </div>
    </>
  );
}
