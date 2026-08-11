"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { initFaceLandmarker, disposeFaceLandmarker } from "@/lib/proctor/face";
import { initObjectDetector, disposeObjectDetector } from "@/lib/proctor/objects";
import { ProctorMonitor, type MonitorWarning } from "@/lib/proctor/monitor";
import { Transcriber, isSttSupported } from "@/lib/proctor/stt";
import { KeystrokeTracker } from "@/lib/proctor/telemetry";

type LinkInfo = {
  candidateName: string;
  domain: string;
  domainBlurb: string;
  difficulty: string;
  questionCount: number;
  mcqCount: number;
  spokenCount: number;
  typedCount: number;
  durationSec: number;
  resumable: boolean;
};

type Question = {
  id: string;
  order: number;
  total: number;
  type: "MCQ" | "CONCEPTUAL" | "SCENARIO" | "CODING" | "BEHAVIORAL";
  answerMode: "CHOICE" | "TYPED" | "SPOKEN";
  prompt: string;
  options: string[];
  timeLimitSec: number;
  servedAt: string;
};

type Stage = "loading" | "error" | "consent" | "devices" | "rules" | "interview" | "done";

const TYPE_LABEL: Record<Question["type"], string> = {
  MCQ: "Multiple choice",
  CONCEPTUAL: "About the field",
  SCENARIO: "Problem statement",
  CODING: "Hands-on task",
  BEHAVIORAL: "Your experience",
};

export function InterviewClient({ token }: { token: string }) {
  const [stage, setStage] = useState<Stage>("loading");
  const [info, setInfo] = useState<LinkInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [deadlineAt, setDeadlineAt] = useState<number | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [remaining, setRemaining] = useState<number>(0);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [sttOk, setSttOk] = useState(false);
  const [faceOk, setFaceOk] = useState(false);
  const [objectOk, setObjectOk] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [preparingStep, setPreparingStep] = useState("");

  // Answer state, shared across the three input modes.
  const [answer, setAnswer] = useState("");
  const [interim, setInterim] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [editingTranscript, setEditingTranscript] = useState(false);
  const [transcriptEdited, setTranscriptEdited] = useState(false);
  /** Set when dictation dies mid-question; the answer falls back to typing. */
  const [sttFailed, setSttFailed] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [warnings, setWarnings] = useState<MonitorWarning[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const monitorRef = useRef<ProctorMonitor | null>(null);
  const transcriberRef = useRef<Transcriber | null>(null);
  const trackerRef = useRef(new KeystrokeTracker());
  const finishedRef = useRef(false);

  /**
   * The preview element is remounted whenever the stage changes, so the stream
   * is re-attached on every mount rather than assigned once. Losing the stream
   * mid-interview would silently disable all camera monitoring.
   */
  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current && el.srcObject !== streamRef.current) {
      el.srcObject = streamRef.current;
      void el.play().catch(() => {});
    }
  }, []);

  // --- Load link info -------------------------------------------------------
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/interview/${token}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "This interview link is not valid.");
        setStage("error");
        return;
      }
      setInfo(data);
      setStage("consent");
    })();
  }, [token]);

  // --- Countdown ------------------------------------------------------------
  useEffect(() => {
    if (stage !== "interview" || deadlineAt === null) return;
    const tick = () => {
      const left = Math.max(0, Math.round((deadlineAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) void finish("time_expired");
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, deadlineAt]);

  // --- Cleanup --------------------------------------------------------------
  useEffect(() => {
    return () => {
      transcriberRef.current?.stop();
      void monitorRef.current?.stop();
      disposeFaceLandmarker();
      disposeObjectDetector();
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  const pushWarning = useCallback((w: MonitorWarning) => {
    setWarnings((prev) => [...prev.slice(-3), w]);
    window.setTimeout(
      () => setWarnings((prev) => prev.filter((x) => x.at !== w.at)),
      6000,
    );
  }, []);

  // --- Device check ---------------------------------------------------------
  async function requestDevices() {
    setPreparing(true);
    setDeviceError(null);
    try {
      setPreparingStep("Requesting camera and microphone…");
      const media = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = media;
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
        await videoRef.current.play().catch(() => {});
      }

      setSttOk(isSttSupported());
      setPreparingStep("Loading face detection…");
      setFaceOk(await initFaceLandmarker());
      setPreparingStep("Loading object detection…");
      setObjectOk(await initObjectDetector());
      setStage("rules");
    } catch (err) {
      setDeviceError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera and microphone access were denied. This interview cannot run without them — enable both in your browser's site settings and reload."
          : "Could not access your camera and microphone. Close any other app using them and try again.",
      );
    } finally {
      setPreparing(false);
      setPreparingStep("");
    }
  }

  // --- Start ----------------------------------------------------------------
  async function startInterview() {
    if (!stream) return;
    setPreparing(true);
    try {
      await document.documentElement.requestFullscreen().catch(() => {});
    } catch {
      /* fullscreen is best-effort */
    }

    const screenAny = window.screen as Screen & { isExtended?: boolean };
    const res = await fetch(`/api/interview/${token}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consent: true,
        sttAvailable: sttOk,
        faceModelLoaded: faceOk,
        objectModelLoaded: objectOk,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          displays: screenAny.isExtended ? 2 : 1,
          devicePixelRatio: window.devicePixelRatio,
        },
      }),
    });
    const data = await res.json().catch(() => ({}));
    setPreparing(false);

    if (!res.ok) {
      setError(data.error ?? "Could not start the interview.");
      setStage("error");
      return;
    }
    if (data.done) {
      setStage("done");
      return;
    }

    setSessionId(data.sessionId);
    setDeadlineAt(data.deadlineAt ? new Date(data.deadlineAt).getTime() : null);

    const monitor = new ProctorMonitor({
      token,
      sessionId: data.sessionId,
      getVideo: () => videoRef.current,
      stream,
      faceModelReady: faceOk,
      objectModelReady: objectOk,
      onWarning: pushWarning,
    });
    await monitor.start();
    monitorRef.current = monitor;

    setStage("interview");
    loadQuestion(data.question);
  }

  function loadQuestion(q: Question | null) {
    transcriberRef.current?.stop();
    transcriberRef.current = null;
    trackerRef.current.reset();
    setAnswer("");
    setInterim("");
    setSelected(null);
    setEditingTranscript(false);
    setTranscriptEdited(false);
    setSttFailed(null);
    setQuestion(q);

    const spoken = q?.answerMode === "SPOKEN" && sttOk;
    // Tell the monitor whether the candidate's own voice is expected, so their
    // answer is never flagged as a background voice.
    monitorRef.current?.setExpectingSpeech(Boolean(spoken));

    if (spoken) {
      const t = new Transcriber(
        (finalText, interimText) => {
          setAnswer(finalText);
          setInterim(interimText);
        },
        (err, fatal) => {
          console.warn("[stt]", err);
          // Dictation is dead for this question — switch to typing rather than
          // leaving the candidate speaking into a transcript that never fills.
          if (fatal) {
            setSttFailed(
              err === "network"
                ? "Speech recognition could not reach its service. Type your answer instead — you are not penalised for this."
                : "Speech recognition stopped working. Type your answer instead — you are not penalised for this.",
            );
            setInterim("");
          }
        },
      );
      t.start();
      transcriberRef.current = t;
    }
  }

  // --- Transcript editing ---------------------------------------------------
  function beginEditing() {
    transcriberRef.current?.pause();
    setAnswer(transcriberRef.current?.getTranscript() ?? answer);
    setInterim("");
    setEditingTranscript(true);
  }

  function finishEditing(resumeDictation: boolean) {
    transcriberRef.current?.setText(answer);
    setEditingTranscript(false);
    if (resumeDictation) transcriberRef.current?.resume();
  }

  // --- Submit ---------------------------------------------------------------
  async function submitAnswer() {
    if (!question || !sessionId || submitting) return;
    setSubmitting(true);

    const transcriber = transcriberRef.current;
    let finalAnswer = answer;
    if (question.answerMode === "SPOKEN" && transcriber) {
      // An edited transcript is authoritative; otherwise take the live one.
      finalAnswer = editingTranscript || transcriptEdited
        ? answer
        : transcriber.getTranscript() || answer;
    }
    const spokenMs = transcriber?.getSpokenMs() ?? 0;
    transcriber?.stop();

    const typedThisAnswer =
      question.answerMode === "TYPED" ||
      (question.answerMode === "SPOKEN" && (!sttOk || sttFailed !== null));
    const telemetry = typedThisAnswer ? trackerRef.current.snapshot(finalAnswer) : null;

    await monitorRef.current?.flush();

    const res = await fetch(`/api/interview/${token}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        questionId: question.id,
        answerText: question.answerMode === "CHOICE" ? "" : finalAnswer,
        selectedIndex: question.answerMode === "CHOICE" ? selected : null,
        spokenMs,
        transcriptEdited,
        telemetry,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      if (res.status === 410) {
        await finish("time_expired");
        return;
      }
      setError(data.error ?? "Could not submit your answer.");
      setStage("error");
      return;
    }

    if (data.done) {
      await finish("completed");
    } else {
      loadQuestion(data.question);
    }
  }

  async function finish(reason: "completed" | "time_expired" | "abandoned") {
    if (finishedRef.current || !sessionId) return;
    finishedRef.current = true;

    transcriberRef.current?.stop();
    await monitorRef.current?.stop();
    stream?.getTracks().forEach((t) => t.stop());
    disposeFaceLandmarker();
    disposeObjectDetector();

    await fetch(`/api/interview/${token}/finish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, reason }),
    }).catch(() => {});

    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    setStage("done");
  }

  const canSubmit =
    question?.answerMode === "CHOICE"
      ? selected !== null
      : answer.trim().length > 0 || interim.trim().length > 0;

  // --- Render ---------------------------------------------------------------

  if (stage === "loading") return <Centred>Loading your interview…</Centred>;

  if (stage === "error") {
    return (
      <Centred>
        <div className="card max-w-md p-7 text-center">
          <h1 className="text-lg font-semibold text-bad">Interview unavailable</h1>
          <p className="mt-2 text-sm text-ink-300">{error}</p>
          <p className="mt-4 text-xs text-ink-400">
            Contact the recruiter who sent you this link.
          </p>
        </div>
      </Centred>
    );
  }

  if (stage === "done") {
    return (
      <Centred>
        <div className="card max-w-md p-7 text-center">
          <h1 className="text-lg font-semibold text-good">Interview submitted</h1>
          <p className="mt-2 text-sm text-ink-300">
            Thank you. Your answers have been recorded and sent to the hiring team.
            You can close this tab — the recruiter will follow up by email.
          </p>
        </div>
      </Centred>
    );
  }

  if (stage === "consent" && info) {
    return (
      <Centred>
        <div className="card w-full max-w-2xl p-7">
          <h1 className="text-lg font-semibold">
            {info.domain} interview — {info.candidateName}
          </h1>
          <p className="mt-1 text-sm text-ink-400">
            {info.questionCount} questions · {Math.round(info.durationSec / 60)} minutes
            total · {info.difficulty.toLowerCase()} level
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {info.mcqCount > 0 && <Tag>{info.mcqCount} multiple choice</Tag>}
            {info.spokenCount > 0 && <Tag>{info.spokenCount} spoken aloud</Tag>}
            {info.typedCount > 0 && <Tag>{info.typedCount} written</Tag>}
          </div>

          <div className="mt-6 rounded-lg border border-ink-700 bg-ink-850 p-4">
            <h2 className="text-sm font-semibold">Before you begin — what is recorded</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-300">
              <li>
                · Your <strong>camera and microphone stay on</strong> for the whole
                interview. The live video is analysed in your browser and is{" "}
                <strong>not uploaded</strong>.
              </li>
              <li>
                · Your browser checks the camera for a second person and for a phone or
                tablet in shot, and listens for another voice in the room.
              </li>
              <li>
                · Still images are saved <strong>only</strong> when something is flagged —
                for example if nobody is visible, or a second person appears.
              </li>
              <li>
                · Your spoken answers are transcribed to text. In Chrome the audio is
                processed by Google&apos;s speech service. You may correct the transcript
                before submitting — that is expected and is not held against you.
              </li>
              <li>
                · Browser activity is logged: leaving the tab, exiting fullscreen,
                pasting, and how you type.
              </li>
              <li>
                · This data is shared with the hiring team to assess your answers and is
                deleted when the hiring process concludes.
              </li>
            </ul>
          </div>

          <p className="mt-4 text-sm text-ink-300">
            You must be alone, in a quiet room, with no second screen, phone, or notes.
            Answers are scored by an AI system and reviewed by a person before any
            decision is made.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={() => setStage("devices")}>
              I consent — continue
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setError(
                  "You declined the recording notice. The interview cannot proceed without it — reply to the recruiter to arrange an alternative.",
                );
                setStage("error");
              }}
            >
              I do not consent
            </button>
          </div>
        </div>
      </Centred>
    );
  }

  if (stage === "devices") {
    return (
      <Centred>
        <div className="card w-full max-w-lg p-7">
          <h1 className="text-lg font-semibold">Camera and microphone check</h1>
          <p className="mt-1 text-sm text-ink-400">
            Allow access when your browser asks. Both are required.
          </p>

          <div className="mt-5 aspect-video overflow-hidden rounded-lg bg-ink-950">
            <video
              ref={attachVideo}
              className="h-full w-full scale-x-[-1] object-cover"
              muted
              playsInline
            />
          </div>

          {deviceError && (
            <p className="mt-4 text-sm text-bad" role="alert">
              {deviceError}
            </p>
          )}

          <button
            className="btn btn-primary mt-5 w-full"
            onClick={requestDevices}
            disabled={preparing}
          >
            {preparing ? preparingStep || "Preparing…" : "Enable camera and microphone"}
          </button>

          <p className="mt-4 text-xs leading-relaxed text-ink-400">
            Use Chrome or Edge on a laptop or desktop. Loading the monitoring models
            takes a few seconds on first run. Speech recognition is not available in
            Safari or Firefox — if you continue there, spoken questions fall back to
            typing.
          </p>
        </div>
      </Centred>
    );
  }

  if (stage === "rules" && info) {
    return (
      <Centred>
        <div className="card w-full max-w-2xl p-7">
          <h1 className="text-lg font-semibold">You are ready to start</h1>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="aspect-video overflow-hidden rounded-lg bg-ink-950">
              <video
                ref={attachVideo}
                className="h-full w-full scale-x-[-1] object-cover"
                muted
                playsInline
                autoPlay
              />
            </div>
            <ul className="space-y-2 text-sm">
              <Check ok label="Camera and microphone connected" />
              <Check
                ok={faceOk}
                label={
                  faceOk
                    ? "Face monitoring active"
                    : "Face monitoring unavailable — reported to the recruiter"
                }
              />
              <Check
                ok={objectOk}
                label={
                  objectOk
                    ? "Phone and second-person detection active"
                    : "Phone detection unavailable — reported to the recruiter"
                }
              />
              <Check
                ok={sttOk}
                label={
                  sttOk
                    ? "Speech recognition available"
                    : "Speech recognition unavailable — you will type every answer"
                }
              />
            </ul>
          </div>

          <div className="mt-6 rounded-lg border border-ink-700 bg-ink-850 p-4 text-sm text-ink-300">
            <p className="font-semibold text-ink-100">Rules</p>
            <ul className="mt-2 space-y-1">
              <li>· Stay in fullscreen. Leaving the tab or window is logged.</li>
              <li>· Stay alone and in frame. Keep your phone out of shot.</li>
              <li>· Pasting into answers is blocked and recorded.</li>
              <li>
                · The clock runs for {Math.round(info.durationSec / 60)} minutes from the
                moment you press start and does not pause.
              </li>
              <li>· Questions appear one at a time and cannot be revisited.</li>
              <li>
                · For spoken questions you can pause and correct the transcript before
                submitting.
              </li>
            </ul>
          </div>

          <button
            className="btn btn-primary mt-6 w-full"
            onClick={startInterview}
            disabled={preparing}
          >
            {preparing ? "Starting…" : "Start interview"}
          </button>
        </div>
      </Centred>
    );
  }

  // --- Interview ------------------------------------------------------------
  const lowTime = remaining < 120;
  const progress = question ? (question.order / question.total) * 100 : 0;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-ink-700 bg-ink-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <div className="min-w-0 flex-1">
            <div className="text-sm text-ink-400">
              {question ? `Question ${question.order + 1} of ${question.total}` : "…"}
            </div>
            <div className="meter mt-2 max-w-xs">
              <span style={{ width: `${progress}%`, background: "var(--color-accent)" }} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-12 w-16 overflow-hidden rounded-md border border-ink-700 bg-ink-950">
              <video
                ref={attachVideo}
                className="h-full w-full scale-x-[-1] object-cover"
                muted
                playsInline
                autoPlay
              />
            </div>
            <div
              className="mono text-lg font-semibold tabular-nums"
              style={{ color: lowTime ? "var(--color-bad)" : "var(--color-ink-100)" }}
              aria-label="Time remaining"
            >
              {String(Math.floor(remaining / 60)).padStart(2, "0")}:
              {String(remaining % 60).padStart(2, "0")}
            </div>
          </div>
        </div>
      </header>

      {warnings.length > 0 && (
        <div className="fixed right-4 top-24 z-20 w-72 space-y-2">
          {warnings.map((w) => (
            <div
              key={w.at}
              role="alert"
              className="rounded-lg border p-3 text-xs"
              style={{
                borderColor: "color-mix(in srgb, var(--color-bad) 45%, transparent)",
                background: "color-mix(in srgb, var(--color-bad) 12%, var(--color-ink-900))",
              }}
            >
              {w.message}
            </div>
          ))}
        </div>
      )}

      <main className="mx-auto max-w-5xl px-5 py-8">
        {question && (
          <>
            <div className="card p-6">
              <span
                className="pill"
                style={{
                  color: "var(--color-accent)",
                  background: "color-mix(in srgb, var(--color-accent) 14%, transparent)",
                }}
              >
                {TYPE_LABEL[question.type]}
              </span>
              <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed">
                {question.prompt}
              </p>
              <p className="mt-3 text-xs text-ink-400">
                Suggested time: {Math.round(question.timeLimitSec / 60)} minutes. You can
                submit early; you cannot come back.
              </p>
            </div>

            <div className="card mt-5 p-6">
              {/* ---- Multiple choice ---- */}
              {question.answerMode === "CHOICE" && (
                <>
                  <div className="label">Select one answer</div>
                  <div className="space-y-2" role="radiogroup">
                    {question.options.map((opt, i) => (
                      <button
                        key={i}
                        role="radio"
                        aria-checked={selected === i}
                        onClick={() => setSelected(i)}
                        className="flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors"
                        style={{
                          borderColor:
                            selected === i ? "var(--color-accent)" : "var(--color-ink-700)",
                          background:
                            selected === i
                              ? "color-mix(in srgb, var(--color-accent) 12%, transparent)"
                              : "var(--color-ink-850)",
                        }}
                      >
                        <span
                          className="mono mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs"
                          style={{
                            borderColor:
                              selected === i
                                ? "var(--color-accent)"
                                : "var(--color-ink-600)",
                            color:
                              selected === i
                                ? "var(--color-accent)"
                                : "var(--color-ink-400)",
                          }}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-ink-400">
                    Exactly one option is correct. There is no negative marking for a
                    wrong answer, so do not leave it blank.
                  </p>
                </>
              )}

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

              {/* ---- Spoken with live transcript ---- */}
              {question.answerMode === "SPOKEN" && sttOk && !sttFailed && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          background: editingTranscript
                            ? "var(--color-ink-600)"
                            : "var(--color-bad)",
                          animation: editingTranscript ? "none" : "pulse 1.5s infinite",
                        }}
                      />
                      <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                        {editingTranscript ? "Recording paused" : "Listening — speak your answer"}
                      </span>
                    </div>
                    {editingTranscript ? (
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost text-xs"
                          onClick={() => finishEditing(true)}
                        >
                          Done — keep recording
                        </button>
                        <button
                          className="btn btn-ghost text-xs"
                          onClick={() => finishEditing(false)}
                        >
                          Done — stop recording
                        </button>
                      </div>
                    ) : (
                      <button className="btn btn-ghost text-xs" onClick={beginEditing}>
                        Pause and edit transcript
                      </button>
                    )}
                  </div>

                  {editingTranscript ? (
                    <textarea
                      className="input mt-3 min-h-40 resize-y text-sm leading-relaxed"
                      value={answer}
                      autoFocus
                      onChange={(e) => {
                        setAnswer(e.target.value);
                        setTranscriptEdited(true);
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        trackerRef.current.onPaste();
                        monitorRef.current?.record("PASTE", 0, {
                          questionId: question.id,
                          context: "transcript_edit",
                        });
                      }}
                    />
                  ) : (
                    <div className="mt-3 min-h-40 rounded-lg bg-ink-950 p-4 text-sm leading-relaxed">
                      {answer || interim ? (
                        <>
                          <span>{answer}</span>{" "}
                          <span className="text-ink-400">{interim}</span>
                        </>
                      ) : (
                        <span className="text-ink-400">
                          Your words will appear here as you speak.
                        </span>
                      )}
                    </div>
                  )}

                  <p className="mt-2 text-xs text-ink-400">
                    Transcription is imperfect. Fix any words it got wrong before
                    submitting — correcting the transcript is expected and is not held
                    against you.
                    {transcriptEdited && (
                      <span className="text-ink-300"> Transcript edited.</span>
                    )}
                  </p>
                </>
              )}

              {/* ---- Typed, and the spoken fallback when dictation is unavailable ---- */}
              {(question.answerMode === "TYPED" ||
                (question.answerMode === "SPOKEN" && (!sttOk || sttFailed))) && (
                <>
                  <label className="label" htmlFor="answer">
                    {question.type === "CODING" ? "Your answer" : "Your response"}
                  </label>
                  <textarea
                    id="answer"
                    className={`input min-h-64 resize-y text-sm leading-relaxed ${
                      question.type === "CODING" ? "mono" : ""
                    }`}
                    spellCheck={question.type !== "CODING"}
                    autoComplete="off"
                    autoCorrect="off"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => trackerRef.current.onKeyDown(e.key)}
                    onPaste={(e) => {
                      e.preventDefault();
                      trackerRef.current.onPaste();
                      monitorRef.current?.record("PASTE", 0, {
                        questionId: question.id,
                        length: e.clipboardData.getData("text").length,
                      });
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
                    {question.answerMode === "SPOKEN" && !sttOk && (
                      <span>
                        {" "}
                        Your browser does not support speech recognition, so this spoken
                        question falls back to typing.
                      </span>
                    )}
                  </p>
                </>
              )}

              <div className="mt-5 flex items-center gap-3">
                <button
                  className="btn btn-primary"
                  onClick={submitAnswer}
                  disabled={submitting || !canSubmit}
                >
                  {submitting
                    ? "Submitting…"
                    : question.order + 1 === question.total
                      ? "Submit and finish"
                      : "Submit and continue"}
                </button>
                {!canSubmit && (
                  <span className="text-xs text-ink-400">
                    {question.answerMode === "CHOICE"
                      ? "Select an option to continue."
                      : "Answer the question to continue."}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <style>{`@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .25 } }`}</style>
    </div>
  );
}

function Centred({ children }: { children: React.ReactNode }) {
  return <main className="grid min-h-screen place-items-center px-4 py-10">{children}</main>;
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-ink-700 bg-ink-850 px-2.5 py-1 text-ink-300">
      {children}
    </span>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-start gap-2">
      <span
        className="mt-0.5 text-sm"
        style={{ color: ok ? "var(--color-good)" : "var(--color-warn)" }}
      >
        {ok ? "✓" : "!"}
      </span>
      <span className={ok ? "text-ink-300" : "text-warn"}>{label}</span>
    </li>
  );
}
