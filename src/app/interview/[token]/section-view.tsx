"use client";

import { useEffect, useRef, useState } from "react";
import type { KeystrokeTracker } from "@/lib/proctor/telemetry";
import type { Transcriber } from "@/lib/proctor/stt";

export type ServedQuestion = {
  id: string;
  indexInSection: number;
  type: "MCQ" | "CONCEPTUAL" | "SCENARIO" | "CODING" | "BEHAVIORAL";
  answerMode: "CHOICE" | "TYPED" | "SPOKEN";
  prompt: string;
  options: string[];
  timeLimitSec: number;
  answerText: string;
  selectedIndex: number | null;
  skipped: boolean;
};

export type ServedSection = {
  index: number;
  total: number;
  type: ServedQuestion["type"];
  title: string;
  instructions: string;
  questions: ServedQuestion[];
  suggestedSec: number;
  servedAt: string;
};

/** Per-question local answer state, keyed by question id. */
export type DraftMap = Record<
  string,
  { answerText: string; selectedIndex: number | null; touched: boolean }
>;

type Props = {
  section: ServedSection;
  drafts: DraftMap;
  sttOk: boolean;
  sttFailed: string | null;
  transcriberRef: React.RefObject<Transcriber | null>;
  trackerRef: React.RefObject<KeystrokeTracker>;
  submitting: boolean;
  /** Live partial transcript, owned by the parent that runs the recogniser. */
  interimText: string;
  onChange: (questionId: string, patch: Partial<DraftMap[string]>) => void;
  onSaveDraft: (questionId: string) => void;
  onPaste: (questionId: string, length: number) => void;
  onSubmitSection: () => void;
  onSpokenFocus: (question: ServedQuestion) => void;
};

export function SectionView({
  section,
  drafts,
  sttOk,
  sttFailed,
  transcriberRef,
  trackerRef,
  submitting,
  interimText,
  onChange,
  onSaveDraft,
  onPaste,
  onSubmitSection,
  onSpokenFocus,
}: Props) {
  const [cursor, setCursor] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const lastQuestionId = useRef<string | null>(null);

  const question = section.questions[cursor];
  const isLast = cursor === section.questions.length - 1;
  const isFirst = cursor === 0;

  // Reset to the first question whenever a new section arrives.
  useEffect(() => {
    setCursor(0);
    setConfirming(false);
  }, [section.index]);

  // Starting or stopping dictation is tied to which question is on screen, not
  // to the section, so moving between spoken questions restarts cleanly.
  useEffect(() => {
    if (!question) return;
    if (lastQuestionId.current === question.id) return;
    lastQuestionId.current = question.id;
    onSpokenFocus(question);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id]);

  if (!question) return null;

  const draft = drafts[question.id] ?? {
    answerText: "",
    selectedIndex: null,
    touched: false,
  };

  const answeredCount = section.questions.filter((q) => {
    const d = drafts[q.id];
    if (!d) return false;
    return q.answerMode === "CHOICE" ? d.selectedIndex !== null : d.answerText.trim() !== "";
  }).length;

  const isAnswered = (q: ServedQuestion) => {
    const d = drafts[q.id];
    if (!d) return false;
    return q.answerMode === "CHOICE" ? d.selectedIndex !== null : d.answerText.trim() !== "";
  };

  function goTo(next: number) {
    onSaveDraft(question.id);
    setCursor(Math.max(0, Math.min(section.questions.length - 1, next)));
  }

  const spokenLive = question.answerMode === "SPOKEN" && sttOk && !sttFailed;

  return (
    <>
      {/* ---- Section header ---- */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="pill" style={{ color: "var(--color-accent)", background: "color-mix(in srgb, var(--color-accent) 14%, transparent)" }}>
                Section {section.index + 1} of {section.total}
              </span>
              <h1 className="text-base font-semibold">{section.title}</h1>
            </div>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-ink-400">
              {section.instructions}
            </p>
          </div>
          <div className="text-right text-xs text-ink-400">
            <div>
              {answeredCount} of {section.questions.length} answered
            </div>
            <div className="mt-1">
              ~{Math.round(section.suggestedSec / 60)} min suggested
            </div>
          </div>
        </div>

        {/* ---- Question pips: jump anywhere inside this section ---- */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {section.questions.map((q, i) => {
            const answered = isAnswered(q);
            const current = i === cursor;
            return (
              <button
                key={q.id}
                onClick={() => goTo(i)}
                aria-label={`Question ${i + 1}${answered ? ", answered" : ", not answered"}`}
                aria-current={current}
                className="mono h-8 w-8 rounded-md border text-xs font-semibold transition-colors"
                style={{
                  borderColor: current
                    ? "var(--color-accent)"
                    : answered
                      ? "color-mix(in srgb, var(--color-good) 55%, transparent)"
                      : "var(--color-ink-700)",
                  background: current
                    ? "color-mix(in srgb, var(--color-accent) 18%, transparent)"
                    : answered
                      ? "color-mix(in srgb, var(--color-good) 12%, transparent)"
                      : "var(--color-ink-850)",
                  color: current
                    ? "var(--color-accent)"
                    : answered
                      ? "var(--color-good)"
                      : "var(--color-ink-400)",
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- The question ---- */}
      <div className="card mt-5 p-6">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Question {cursor + 1} of {section.questions.length}
          </span>
          <span className="text-xs text-ink-400">
            ~{Math.round(question.timeLimitSec / 60)} min suggested
          </span>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed">
          {question.prompt}
        </p>
      </div>

      {/* ---- The answer ---- */}
      <div className="card mt-5 p-6">
        {sttFailed && (
          <p
            className="mb-4 rounded-md border p-3 text-xs"
            role="alert"
            style={{
              borderColor: "color-mix(in srgb, var(--color-warn) 45%, transparent)",
              background: "color-mix(in srgb, var(--color-warn) 10%, transparent)",
              color: "var(--color-warn)",
            }}
          >
            {sttFailed}
          </p>
        )}

        {question.answerMode === "CHOICE" && (
          <>
            <div className="label">Select one answer</div>
            <div className="space-y-2" role="radiogroup">
              {question.options.map((opt, i) => {
                const chosen = draft.selectedIndex === i;
                return (
                  <button
                    key={i}
                    role="radio"
                    aria-checked={chosen}
                    onClick={() =>
                      onChange(question.id, { selectedIndex: chosen ? null : i, touched: true })
                    }
                    className="flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors"
                    style={{
                      borderColor: chosen ? "var(--color-accent)" : "var(--color-ink-700)",
                      background: chosen
                        ? "color-mix(in srgb, var(--color-accent) 12%, transparent)"
                        : "var(--color-ink-850)",
                    }}
                  >
                    <span
                      className="mono mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs"
                      style={{
                        borderColor: chosen ? "var(--color-accent)" : "var(--color-ink-600)",
                        color: chosen ? "var(--color-accent)" : "var(--color-ink-400)",
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-ink-400">
              Click a selected option again to clear it. No penalty for a wrong answer.
            </p>
          </>
        )}

        {spokenLive && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: "var(--color-bad)",
                    animation: "pulse 1.5s infinite",
                  }}
                />
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Listening — speak your answer
                </span>
              </div>
              <button
                className="btn btn-ghost text-xs"
                onClick={() => {
                  transcriberRef.current?.pause();
                  onChange(question.id, {
                    answerText: transcriberRef.current?.getTranscript() ?? draft.answerText,
                    touched: true,
                  });
                }}
              >
                Pause to edit
              </button>
            </div>
            <textarea
              className="input mt-3 min-h-40 resize-y text-sm leading-relaxed"
              value={draft.answerText + (interimText ? ` ${interimText}` : "")}
              onChange={(e) => {
                transcriberRef.current?.setText(e.target.value);
                onChange(question.id, { answerText: e.target.value, touched: true });
              }}
              onPaste={(e) => {
                e.preventDefault();
                onPaste(question.id, e.clipboardData.getData("text").length);
              }}
              placeholder="Your words appear here as you speak. Correct anything the recogniser gets wrong."
            />
            <p className="mt-2 text-xs text-ink-400">
              Editing the transcript is expected and is not held against you.
            </p>
          </>
        )}

        {(question.answerMode === "TYPED" ||
          (question.answerMode === "SPOKEN" && (!sttOk || sttFailed))) && (
          <>
            <label className="label" htmlFor={`answer-${question.id}`}>
              {question.type === "CODING" ? "Your answer" : "Your response"}
            </label>
            <textarea
              id={`answer-${question.id}`}
              className={`input min-h-64 resize-y text-sm leading-relaxed ${
                question.type === "CODING" ? "mono" : ""
              }`}
              spellCheck={question.type !== "CODING"}
              autoComplete="off"
              value={draft.answerText}
              onChange={(e) => onChange(question.id, { answerText: e.target.value, touched: true })}
              onKeyDown={(e) => trackerRef.current?.onKeyDown(e.key)}
              onPaste={(e) => {
                e.preventDefault();
                trackerRef.current?.onPaste();
                onPaste(question.id, e.clipboardData.getData("text").length);
              }}
              onDrop={(e) => e.preventDefault()}
              placeholder={
                question.type === "CODING"
                  ? "Write your solution here. Pasting is disabled."
                  : "Write your answer here. Pasting is disabled."
              }
            />
            <p className="mt-2 text-xs text-ink-400">
              Pasting is disabled. Typing patterns are recorded.
            </p>
          </>
        )}
      </div>

      {/* ---- Navigation ---- */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button className="btn btn-ghost" onClick={() => goTo(cursor - 1)} disabled={isFirst}>
          ← Previous
        </button>

        {!isLast && (
          <>
            <button className="btn btn-primary" onClick={() => goTo(cursor + 1)}>
              Next →
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => goTo(cursor + 1)}
              title="Move on without answering. You can come back to it while this section is open."
            >
              Skip for now
            </button>
          </>
        )}

        {isLast && !confirming && (
          <button className="btn btn-primary" onClick={() => setConfirming(true)}>
            {section.index + 1 === section.total ? "Review and finish" : "Review and submit section"}
          </button>
        )}

        <span className="ml-auto text-xs text-ink-400">
          Answers save automatically as you move between questions.
        </span>
      </div>

      {/* ---- Section submit confirmation ---- */}
      {confirming && (
        <div className="card mt-5 border-warn/40 p-5">
          <h2 className="text-sm font-semibold">
            Submit &ldquo;{section.title}&rdquo;?
          </h2>
          <p className="mt-2 text-sm text-ink-300">
            {answeredCount === section.questions.length ? (
              <>All {section.questions.length} questions are answered.</>
            ) : (
              <>
                <strong className="text-warn">
                  {section.questions.length - answeredCount} question
                  {section.questions.length - answeredCount === 1 ? "" : "s"} unanswered
                </strong>{" "}
                — they will be recorded as skipped.
              </>
            )}{" "}
            Once you submit this section you cannot return to it.
          </p>

          {answeredCount < section.questions.length && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {section.questions.map((q, i) =>
                isAnswered(q) ? null : (
                  <button
                    key={q.id}
                    className="mono rounded-md border border-warn/50 px-2 py-1 text-xs text-warn"
                    onClick={() => {
                      setConfirming(false);
                      goTo(i);
                    }}
                  >
                    Go to Q{i + 1}
                  </button>
                ),
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={onSubmitSection} disabled={submitting}>
              {submitting
                ? "Submitting…"
                : section.index + 1 === section.total
                  ? "Submit and finish interview"
                  : "Submit section and continue"}
            </button>
            <button className="btn btn-ghost" onClick={() => setConfirming(false)}>
              Keep working
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .25 } }`}</style>
    </>
  );
}
