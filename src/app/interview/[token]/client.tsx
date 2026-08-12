"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { initFaceLandmarker, disposeFaceLandmarker } from "@/lib/proctor/face";
import { initObjectDetector, disposeObjectDetector } from "@/lib/proctor/objects";
import { ProctorMonitor, type MonitorWarning } from "@/lib/proctor/monitor";
import { Transcriber, isSttSupported } from "@/lib/proctor/stt";
import { KeystrokeTracker } from "@/lib/proctor/telemetry";
import { CameraCheck, Guide, MicCheck } from "./checkin";
import {
  SectionView,
  type DraftMap,
  type ServedQuestion,
  type ServedSection,
} from "./section-view";

type LinkInfo = {
  candidateName: string;
  domain: string;
  difficulty: string;
  questionCount: number;
  mcqCount: number;
  spokenCount: number;
  typedCount: number;
  durationSec: number;
};

type Progress = { totalQuestions: number; answeredQuestions: number; totalSections: number };

type Stage =
  | "loading"
  | "error"
  | "consent"
  | "permissions"
  | "camera"
  | "mic"
  | "guide"
  | "interview"
  | "done";

export function InterviewClient({ token }: { token: string }) {
  const [stage, setStage] = useState<Stage>("loading");
  const [info, setInfo] = useState<LinkInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [deadlineAt, setDeadlineAt] = useState<number | null>(null);
  const [section, setSection] = useState<ServedSection | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [remaining, setRemaining] = useState(0);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [sttOk, setSttOk] = useState(false);
  const [sttFailed, setSttFailed] = useState<string | null>(null);
  const [faceOk, setFaceOk] = useState(false);
  const [objectOk, setObjectOk] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [preparingStep, setPreparingStep] = useState("");

  const [identityPhoto, setIdentityPhoto] = useState<string | null>(null);
  const [micVerified, setMicVerified] = useState(true);
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [interimText, setInterimText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [warnings, setWarnings] = useState<MonitorWarning[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const monitorRef = useRef<ProctorMonitor | null>(null);
  const transcriberRef = useRef<Transcriber | null>(null);
  const trackerRef = useRef(new KeystrokeTracker());
  const finishedRef = useRef(false);
  const draftsRef = useRef<DraftMap>({});
  const editedRef = useRef<Set<string>>(new Set());

  draftsRef.current = drafts;

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
    setWarnings((prev) => {
      // Collapse repeats of the same warning rather than stacking them. Looking
      // away three times should refresh one notice, not build a wall of
      // identical toasts over the question the candidate is trying to read.
      const others = prev.filter((x) => x.type !== w.type);
      return [...others.slice(-2), w];
    });
    window.setTimeout(() => setWarnings((prev) => prev.filter((x) => x.id !== w.id)), 6000);
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
      setStage("camera");
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

  /** Seeds local drafts from whatever the server already has for a section. */
  function adoptSection(next: ServedSection | null) {
    setSection(next);
    setInterimText("");
    if (!next) return;
    const seeded: DraftMap = {};
    for (const q of next.questions) {
      seeded[q.id] = {
        answerText: q.answerText,
        selectedIndex: q.selectedIndex,
        touched: false,
      };
    }
    setDrafts(seeded);
    draftsRef.current = seeded;
  }

  // --- Start ----------------------------------------------------------------
  async function startInterview() {
    if (!stream) return;
    setPreparing(true);
    await document.documentElement.requestFullscreen().catch(() => {});

    const screenAny = window.screen as Screen & { isExtended?: boolean };
    const res = await fetch(`/api/interview/${token}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consent: true,
        sttAvailable: sttOk,
        faceModelLoaded: faceOk,
        objectModelLoaded: objectOk,
        identityPhoto: identityPhoto ?? undefined,
        micVerified,
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
    setProgress(data.progress ?? null);

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

    adoptSection(data.section);
    setStage("interview");
  }

  // --- Dictation, scoped to the question on screen --------------------------
  function onSpokenFocus(question: ServedQuestion) {
    transcriberRef.current?.stop();
    transcriberRef.current = null;
    trackerRef.current.reset();
    setInterimText("");

    const spoken = question.answerMode === "SPOKEN" && sttOk && !sttFailed;
    monitorRef.current?.setExpectingSpeech(spoken);
    if (!spoken) return;

    const existing = draftsRef.current[question.id]?.answerText ?? "";
    const t = new Transcriber(
      (finalText, interim) => {
        // The recogniser owns the tail; anything the candidate typed before
        // dictation resumed is already folded into finalText via setText.
        updateDraft(question.id, { answerText: finalText });
        setInterimText(interim);
      },
      (err, fatal) => {
        console.warn("[stt]", err);
        if (fatal) {
          setSttFailed(
            err === "network"
              ? "Speech recognition could not reach its service. Type your answer instead — you are not penalised for this."
              : "Speech recognition stopped working. Type your answer instead — you are not penalised for this.",
          );
          setInterimText("");
        }
      },
    );
    t.start();
    if (existing) t.setText(existing);
    transcriberRef.current = t;
  }

  function updateDraft(questionId: string, patch: Partial<DraftMap[string]>) {
    setDrafts((prev) => {
      const next = {
        ...prev,
        [questionId]: {
          answerText: patch.answerText ?? prev[questionId]?.answerText ?? "",
          selectedIndex:
            patch.selectedIndex !== undefined
              ? patch.selectedIndex
              : (prev[questionId]?.selectedIndex ?? null),
          touched: patch.touched ?? prev[questionId]?.touched ?? false,
        },
      };
      draftsRef.current = next;
      return next;
    });
  }

  /** Persists one question's draft. Fire-and-forget; failures retry on submit. */
  async function saveDraft(questionId: string) {
    if (!sessionId || !section) return;
    const q = section.questions.find((x) => x.id === questionId);
    const d = draftsRef.current[questionId];
    if (!q || !d) return;

    const isSpoken = q.answerMode === "SPOKEN";
    const answerText = isSpoken
      ? (transcriberRef.current?.getTranscript() || d.answerText)
      : d.answerText;

    await fetch(`/api/interview/${token}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        questionId,
        answerText: q.answerMode === "CHOICE" ? "" : answerText,
        selectedIndex: q.answerMode === "CHOICE" ? d.selectedIndex : null,
        spokenMs: isSpoken ? (transcriberRef.current?.getSpokenMs() ?? 0) : 0,
        transcriptEdited: editedRef.current.has(questionId),
        telemetry:
          q.answerMode === "TYPED" || (isSpoken && (!sttOk || sttFailed))
            ? trackerRef.current.snapshot(answerText)
            : null,
      }),
    }).catch(() => {});
  }

  // --- Section submit -------------------------------------------------------
  async function submitSection() {
    if (!sessionId || !section || submitting) return;
    setSubmitting(true);

    // Flush every draft in the section before closing it, so nothing the
    // candidate typed but never navigated away from is lost.
    for (const q of section.questions) await saveDraft(q.id);
    transcriberRef.current?.stop();
    transcriberRef.current = null;
    await monitorRef.current?.flush();

    const res = await fetch(`/api/interview/${token}/section`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, sectionIndex: section.index }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      if (res.status === 410) return void finish("time_expired");
      setError(data.error ?? "Could not submit this section.");
      setStage("error");
      return;
    }

    editedRef.current.clear();
    setProgress(data.progress ?? progress);
    if (data.done) await finish("completed");
    else adoptSection(data.section);
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
            Thank you. Your answers have been recorded and sent to the hiring team. You
            can close this tab — the recruiter will follow up by email.
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
            {info.questionCount} questions · {Math.round(info.durationSec / 60)} minutes ·{" "}
            {info.difficulty.toLowerCase()} level
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
                · Your <strong>camera and microphone stay on</strong> throughout. The live
                video is analysed in your browser and is <strong>not uploaded</strong>.
              </li>
              <li>
                · Your browser checks for a second person and for a phone or tablet in
                shot, and listens for another voice in the room.
              </li>
              <li>
                · Still images are saved <strong>only</strong> when something is flagged.
              </li>
              <li>
                · Spoken answers are transcribed. In Chrome the audio is processed by
                Google&apos;s speech service. You may correct the transcript — that is
                expected and is not held against you.
              </li>
              <li>
                · Browser activity is logged: leaving the tab, exiting fullscreen,
                pasting, and how you type.
              </li>
              <li>
                · This data goes to the hiring team and is deleted when the process ends.
              </li>
            </ul>
          </div>

          <p className="mt-4 text-sm text-ink-300">
            You must be alone, in a quiet room, with no second screen, phone, or notes.
            Answers are scored automatically and reviewed by a person before any decision.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={() => setStage("permissions")}>
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

  if (stage === "permissions") {
    return (
      <Centred>
        <div className="card w-full max-w-lg p-7">
          <h1 className="text-lg font-semibold">Allow camera and microphone</h1>
          <p className="mt-1 text-sm text-ink-400">
            Your browser will ask for permission. Both are required — the interview
            cannot run without them.
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
            {preparing ? preparingStep || "Preparing…" : "Allow camera and microphone"}
          </button>

          <p className="mt-4 text-xs leading-relaxed text-ink-400">
            Use Chrome or Edge on a laptop or desktop. The monitoring models take a few
            seconds to load the first time.
          </p>
        </div>
      </Centred>
    );
  }

  if (stage === "camera") {
    return (
      <Centred>
        <CameraCheck
          attachVideo={attachVideo}
          getVideo={() => videoRef.current}
          faceModelReady={faceOk}
          photo={identityPhoto}
          onPhoto={setIdentityPhoto}
          onContinue={() => setStage("mic")}
        />
      </Centred>
    );
  }

  if (stage === "mic" && stream) {
    return (
      <Centred>
        <MicCheck
          stream={stream}
          onContinue={(verified) => {
            setMicVerified(verified);
            setStage("guide");
          }}
        />
      </Centred>
    );
  }

  if (stage === "guide" && info) {
    return (
      <Centred>
        <div className="w-full max-w-2xl">
          {/* Device readiness stays visible: if something is unavailable the
              candidate should know before the clock starts, not after. */}
          <div className="card mb-4 p-4">
            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              <Check ok label="Camera and microphone working" />
              <Check ok={identityPhoto !== null} label="Check-in photo taken" />
              <Check
                ok={micVerified}
                label={micVerified ? "Microphone verified" : "Microphone not verified — reported"}
              />
              <Check
                ok={faceOk}
                label={faceOk ? "Face monitoring active" : "Face monitoring unavailable — reported"}
              />
              <Check
                ok={sttOk}
                label={sttOk ? "Speech recognition available" : "Speech recognition unavailable — you will type spoken answers"}
              />
            </ul>
          </div>

          <Guide
            durationMin={Math.round(info.durationSec / 60)}
            sectionCount={progress?.totalSections ?? Math.max(1, [info.mcqCount, info.spokenCount, info.typedCount].filter((n) => n > 0).length)}
            questionCount={info.questionCount}
            hasSpoken={info.spokenCount > 0}
            onStart={startInterview}
            starting={preparing}
          />
        </div>
      </Centred>
    );
  }

  // --- Interview ------------------------------------------------------------
  const lowTime = remaining < 120;
  const pct = progress && progress.totalQuestions > 0
    ? (progress.answeredQuestions / progress.totalQuestions) * 100
    : 0;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-ink-700 bg-ink-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-ink-400">
              {section ? `Section ${section.index + 1} of ${section.total} · ${section.title}` : "…"}
            </div>
            <div className="meter mt-2 max-w-xs">
              <span style={{ width: `${pct}%`, background: "var(--color-accent)" }} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-12 w-16 overflow-hidden rounded-md border border-ink-700 bg-ink-950">
              <video ref={attachVideo} className="h-full w-full scale-x-[-1] object-cover" muted playsInline autoPlay />
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
              key={w.id}
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

      <main className="mx-auto max-w-4xl px-5 py-8">
        {section && (
          <SectionView
            section={section}
            drafts={drafts}
            sttOk={sttOk}
            sttFailed={sttFailed}
            transcriberRef={transcriberRef}
            trackerRef={trackerRef}
            submitting={submitting}
            interimText={interimText}
            onChange={(id, patch) => {
              if (patch.answerText !== undefined) editedRef.current.add(id);
              updateDraft(id, patch);
            }}
            onSaveDraft={(id) => void saveDraft(id)}
            onPaste={(id, length) =>
              monitorRef.current?.record("PASTE", 0, { questionId: id, length })
            }
            onSubmitSection={submitSection}
            onSpokenFocus={onSpokenFocus}
          />
        )}
      </main>
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
      <span className="mt-0.5 text-sm" style={{ color: ok ? "var(--color-good)" : "var(--color-warn)" }}>
        {ok ? "✓" : "!"}
      </span>
      <span className={ok ? "text-ink-300" : "text-warn"}>{label}</span>
    </li>
  );
}
