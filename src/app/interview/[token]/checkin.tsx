"use client";

import { useEffect, useRef, useState } from "react";
import { captureFrame, detect } from "@/lib/proctor/face";
import { VoiceMonitor } from "@/lib/proctor/audio";

/**
 * Check-in: prove the camera works and capture who is sitting the interview,
 * prove the microphone works, then explain the rules before the clock starts.
 *
 * Every step here exists because of a failure it prevents. Without the photo
 * the recruiter has flagged frames of a stranger and nothing to compare them
 * to. Without a real microphone test, a muted mic is discovered at question
 * three, by which point the spoken answers are gone. Without the guide, a
 * candidate is penalised for rules nobody told them.
 */

// --- Camera step ------------------------------------------------------------

type FaceStatus = "waiting" | "none" | "multiple" | "ok";

const FACE_MESSAGE: Record<FaceStatus, string> = {
  waiting: "Starting the camera…",
  none: "No face detected. Move into the centre of the frame and check your lighting.",
  multiple: "More than one person is visible. You must be alone before you can continue.",
  ok: "Face detected. Look at the camera and take your photo.",
};

export function CameraCheck({
  attachVideo,
  getVideo,
  faceModelReady,
  photo,
  onPhoto,
  onContinue,
}: {
  attachVideo: (el: HTMLVideoElement | null) => void;
  getVideo: () => HTMLVideoElement | null;
  faceModelReady: boolean;
  photo: string | null;
  onPhoto: (dataUrl: string | null) => void;
  onContinue: () => void;
}) {
  const [status, setStatus] = useState<FaceStatus>("waiting");

  useEffect(() => {
    if (!faceModelReady || photo) return;
    const id = window.setInterval(() => {
      const video = getVideo();
      if (!video) return;
      const state = detect(video, performance.now());
      if (!state) return;
      setStatus(state.faces === 0 ? "none" : state.faces > 1 ? "multiple" : "ok");
    }, 400);
    return () => window.clearInterval(id);
  }, [faceModelReady, photo, getVideo]);

  // Without the model we cannot verify framing, so allow the photo through and
  // let the recruiter judge it rather than blocking the interview.
  const canCapture = !faceModelReady || status === "ok";

  return (
    <div className="card w-full max-w-lg p-7">
      <StepHeader step={1} total={3} title="Camera check" />
      <p className="mt-1 text-sm text-ink-400">
        We take one photo now so the hiring team can confirm who sat this
        interview. It is stored with your results and nothing else is uploaded.
      </p>

      <div className="mt-5 aspect-video overflow-hidden rounded-lg bg-ink-950">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Your check-in photo" className="h-full w-full object-cover" />
        ) : (
          <video
            ref={attachVideo}
            className="h-full w-full scale-x-[-1] object-cover"
            muted
            playsInline
            autoPlay
          />
        )}
      </div>

      {photo ? (
        <>
          <p className="mt-4 text-sm text-good">
            ✓ Photo captured. Check your face is clearly visible and well lit.
          </p>
          <div className="mt-5 flex gap-3">
            <button className="btn btn-primary flex-1" onClick={onContinue}>
              Looks good — continue
            </button>
            <button className="btn btn-ghost" onClick={() => onPhoto(null)}>
              Retake
            </button>
          </div>
        </>
      ) : (
        <>
          <p
            className="mt-4 text-sm"
            role="status"
            style={{
              color:
                status === "ok"
                  ? "var(--color-good)"
                  : status === "multiple"
                    ? "var(--color-bad)"
                    : "var(--color-warn)",
            }}
          >
            {faceModelReady ? FACE_MESSAGE[status] : "Look at the camera and take your photo."}
          </p>
          <button
            className="btn btn-primary mt-5 w-full"
            disabled={!canCapture}
            onClick={() => {
              const video = getVideo();
              if (video) onPhoto(captureFrame(video, 640));
            }}
          >
            Take photo
          </button>
        </>
      )}
    </div>
  );
}

// --- Microphone step --------------------------------------------------------

/**
 * Absolute floor. Below this the signal is indistinguishable from a dead
 * microphone regardless of the room, so it is the one hard bound.
 */
const MIC_ABSOLUTE_FLOOR = 0.012;
/** Speech must exceed the measured room noise by this factor to count. */
const MIC_SIGNAL_RATIO = 2.2;
const MIC_OK_SAMPLES = 4;
const CALIBRATE_MS = 1200;
/**
 * After this long the candidate is let through regardless.
 *
 * A gate that cannot be passed is worse than no gate. Aggressive noise
 * suppression, unusual hardware and browser audio quirks can all hold the
 * level under any threshold, and the alternative is a candidate permanently
 * unable to sit the interview. The outcome is recorded instead, so the
 * recruiter knows why the spoken answers may be empty.
 */
const MIC_ESCAPE_MS = 15000;

export function MicCheck({
  stream,
  onContinue,
}: {
  stream: MediaStream;
  onContinue: (micVerified: boolean) => void;
}) {
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const [noiseFloor, setNoiseFloor] = useState<number | null>(null);
  const [heard, setHeard] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const [escaped, setEscaped] = useState(false);

  const monitorRef = useRef<VoiceMonitor | null>(null);
  const goodSamples = useRef(0);
  const calibration = useRef<number[]>([]);
  const startedAt = useRef(Date.now());
  const floorRef = useRef<number | null>(null);

  useEffect(() => {
    const monitor = new VoiceMonitor();
    monitorRef.current = monitor;
    let id = 0;

    void monitor.start(stream).then((okStart) => {
      if (!okStart) {
        setSuspended(true);
        return;
      }
      setSuspended(monitor.state() !== "running");

      id = window.setInterval(() => {
        if (monitor.state() !== "running") {
          setSuspended(true);
          return;
        }
        setSuspended(false);

        const { speechEnergy } = monitor.sample();
        setLevel(speechEnergy);
        setPeak((prev) => Math.max(prev, speechEnergy));

        // Learn the room's noise floor first, then judge speech against it. A
        // fixed threshold fails on quiet microphones and noisy rooms alike.
        if (Date.now() - startedAt.current < CALIBRATE_MS) {
          calibration.current.push(speechEnergy);
          return;
        }
        if (floorRef.current === null) {
          const samples = calibration.current;
          const floor = samples.length
            ? samples.reduce((a, b) => a + b, 0) / samples.length
            : 0;
          floorRef.current = floor;
          setNoiseFloor(floor);
          return;
        }

        const threshold = Math.max(
          MIC_ABSOLUTE_FLOOR,
          floorRef.current * MIC_SIGNAL_RATIO,
        );
        if (speechEnergy > threshold) {
          goodSamples.current += 1;
          if (goodSamples.current >= MIC_OK_SAMPLES) setHeard(true);
        } else {
          goodSamples.current = 0;
        }

        if (Date.now() - startedAt.current > MIC_ESCAPE_MS) setEscaped(true);
      }, 100) as unknown as number;
    });

    return () => {
      if (id) window.clearInterval(id);
      monitor.stop();
      monitorRef.current = null;
    };
  }, [stream]);

  function restartCalibration() {
    startedAt.current = Date.now();
    calibration.current = [];
    floorRef.current = null;
    goodSamples.current = 0;
    setNoiseFloor(null);
    setEscaped(false);
  }

  const bars = 20;
  const scale = Math.max(0.12, (noiseFloor ?? 0) * 6);
  const lit = Math.min(bars, Math.round((level / scale) * bars));
  const calibrating = noiseFloor === null && !suspended;

  return (
    <div className="card w-full max-w-lg p-7">
      <StepHeader step={2} total={3} title="Microphone check" />
      <p className="mt-1 text-sm text-ink-400">
        Some questions are answered out loud. Read this sentence aloud so we can
        confirm your microphone is working.
      </p>

      <div className="mt-6 flex items-center gap-1" aria-hidden>
        {Array.from({ length: bars }, (_, i) => (
          <span
            key={i}
            className="h-8 flex-1 rounded-sm transition-colors"
            style={{
              background:
                i < lit
                  ? i > bars * 0.8
                    ? "var(--color-warn)"
                    : "var(--color-good)"
                  : "var(--color-ink-800)",
            }}
          />
        ))}
      </div>

      {/* Real numbers: "it does not work" is unactionable without them. */}
      <p className="mono mt-2 text-[0.7rem] text-ink-400">
        level {level.toFixed(3)} · peak {peak.toFixed(3)} ·{" "}
        {noiseFloor === null ? "calibrating" : "room " + noiseFloor.toFixed(3)}
      </p>

      {suspended ? (
        <>
          <p className="mt-4 text-sm text-warn" role="status">
            Your browser paused audio processing until you interact with the
            page. Press the button below to start the microphone test.
          </p>
          <button
            className="btn btn-primary mt-4 w-full"
            onClick={async () => {
              // Must run inside the click. Browsers only honour resume() from a
              // user gesture, which an effect does not provide.
              const resumed = (await monitorRef.current?.resume()) ?? false;
              setSuspended(!resumed);
              restartCalibration();
            }}
          >
            Start microphone test
          </button>
        </>
      ) : (
        <>
          <p
            className="mt-4 text-sm"
            role="status"
            style={{ color: heard ? "var(--color-good)" : "var(--color-warn)" }}
          >
            {heard
              ? "We can hear you clearly."
              : calibrating
                ? "Measuring background noise — stay quiet for a moment."
                : peak > MIC_ABSOLUTE_FLOOR
                  ? "Almost — speak a little louder, or move closer to the microphone."
                  : "Waiting to hear you. Say a full sentence out loud."}
          </p>

          <button
            className="btn btn-primary mt-5 w-full"
            disabled={!heard && !escaped}
            onClick={() => onContinue(heard)}
          >
            {heard
              ? "Continue"
              : escaped
                ? "Continue without a verified microphone"
                : "Speak to continue"}
          </button>

          {!heard && escaped && (
            <p className="mt-2 text-xs leading-relaxed text-warn">
              We could not detect your voice. You can continue, but spoken
              questions may record nothing — this is noted on your result so the
              hiring team knows why. Fix the microphone first if you can.
            </p>
          )}

          {!heard && !calibrating && (
            <button
              className="mt-3 w-full text-xs text-ink-400 hover:text-ink-100"
              onClick={restartCalibration}
            >
              Recalibrate — use this if the room was noisy when the test started
            </button>
          )}
        </>
      )}

      <details className="mt-4 text-xs text-ink-400">
        <summary className="cursor-pointer">The bars are not moving</summary>
        <ul className="mt-2 space-y-1 pl-4">
          <li>Check the microphone is not muted in your operating system.</li>
          <li>Check the correct input device is selected in your sound settings.</li>
          <li>Close any other app that may be holding the microphone.</li>
          <li>Some headsets have an inline mute switch — check it.</li>
          <li>Reload this page and allow microphone access when prompted.</li>
        </ul>
      </details>
    </div>
  );
}

// --- Guide step -------------------------------------------------------------

export function Guide({
  durationMin,
  sectionCount,
  questionCount,
  hasSpoken,
  onStart,
  starting,
}: {
  durationMin: number;
  sectionCount: number;
  questionCount: number;
  hasSpoken: boolean;
  onStart: () => void;
  starting: boolean;
}) {
  const [understood, setUnderstood] = useState(false);

  return (
    <div className="card w-full max-w-2xl p-7">
      <StepHeader step={3} total={3} title="How this interview works" />
      <p className="mt-1 text-sm text-ink-400">
        Read this before you begin. The clock does not start until you press the
        button at the bottom.
      </p>

      <GuideBlock title="The shape of the test">
        <li>
          <strong>{questionCount} questions</strong> across{" "}
          <strong>{sectionCount} sections</strong>, with{" "}
          <strong>{durationMin} minutes</strong> in total.
        </li>
        <li>
          Each section holds one kind of question. Sections get harder as you go,
          so the early ones are meant to be quick.
        </li>
        <li>
          The timer at the top counts down for the whole interview, not per
          question. It does not pause.
        </li>
      </GuideBlock>

      <GuideBlock title="Moving around">
        <li>
          <strong>Next / Previous</strong> move between questions inside the
          section you are on. You can change any answer freely.
        </li>
        <li>
          <strong>Skip for now</strong> moves on without answering. You can come
          back to it while the section is still open.
        </li>
        <li>
          The <strong>numbered squares</strong> at the top of a section jump
          straight to a question. Green means answered, grey means still blank.
        </li>
        <li>
          <strong>Submit section</strong> closes it and moves you on. You will be
          told how many questions are unanswered and asked to confirm first.
        </li>
        <li className="text-warn">
          <strong>You cannot return to a section once it is submitted.</strong>{" "}
          Check your answers before you confirm.
        </li>
        <li>
          Your answers save automatically as you move between questions, so a
          refresh or a brief disconnection will not lose your work.
        </li>
      </GuideBlock>

      {hasSpoken && (
        <GuideBlock title="Spoken questions">
          <li>
            Some questions are answered <strong>out loud</strong>. Your words
            appear as text while you speak.
          </li>
          <li>
            Speech recognition makes mistakes. Use{" "}
            <strong>Pause to edit</strong> to correct the text before you move
            on — <strong>correcting it is expected and is never held against
            you.</strong>
          </li>
          <li>Speak in full sentences. The hiring team reads the transcript.</li>
        </GuideBlock>
      )}

      <GuideBlock title="What is recorded and reported" tone="warn">
        <li>
          <strong>You must be alone.</strong> A second person detected in the
          room or in the camera frame is reported.
        </li>
        <li>
          <strong>Keep your phone and tablet out of shot.</strong> A phone
          visible on camera is detected and reported.
        </li>
        <li>
          <strong>Another voice in the room</strong> while you are not speaking
          is detected and reported.
        </li>
        <li>
          <strong>Leaving this tab or switching to another window or
          application</strong> is recorded, along with how long you were away.
        </li>
        <li>
          <strong>Leaving fullscreen</strong> is recorded.
        </li>
        <li>
          <strong>A second monitor or extended display</strong> is detected and
          reported.
        </li>
        <li>
          <strong>Screen sharing or screen recording software</strong> that
          moves you away from this window is reported the same way.
        </li>
        <li>
          <strong>Pasting is blocked</strong> in every answer box, and each
          attempt is recorded. So is copying text out of the interview.
        </li>
        <li>
          <strong>How you type</strong> is measured — text appearing far faster
          than a person types is flagged.
        </li>
        <li>
          <strong>Your face must stay visible.</strong> Being out of frame, or
          looking away from the screen for long periods, is recorded.
        </li>
        <li>
          <strong>Developer tools</strong> being opened is reported.
        </li>
      </GuideBlock>

      <GuideBlock title="What this means in practice">
        <li>
          These signals go to the hiring team as context. A single flag is not a
          verdict — a delivery at the door is not treated as cheating.
        </li>
        <li>
          Nothing here changes your score for the answers themselves. Your
          answers are graded on their own merit.
        </li>
        <li>
          Video is <strong>not</strong> uploaded. Still images are saved only at
          the moment something is flagged, plus the photo you just took.
        </li>
      </GuideBlock>

      <GuideBlock title="Before you press start">
        <li>Close every other tab, window and application.</li>
        <li>Silence your phone and put it out of view.</li>
        <li>Make sure nobody will walk into the room.</li>
        <li>Check you will not be interrupted for {durationMin} minutes.</li>
      </GuideBlock>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-ink-700 bg-ink-850 p-4">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
          checked={understood}
          onChange={(e) => setUnderstood(e.target.checked)}
        />
        <span className="text-sm text-ink-300">
          I have read these instructions. I understand that I must be alone, that
          the activity listed above is recorded and reported, and that I cannot
          return to a section once I submit it.
        </span>
      </label>

      <button
        className="btn btn-primary mt-5 w-full"
        disabled={!understood || starting}
        onClick={onStart}
      >
        {starting ? "Starting…" : `Start the interview — ${durationMin} minutes`}
      </button>
      <p className="mt-2 text-center text-xs text-ink-400">
        The timer starts the moment you press this.
      </p>
    </div>
  );
}

// --- Shared bits ------------------------------------------------------------

function StepHeader({ step, total, title }: { step: number; total: number; title: string }) {
  return (
    <>
      <div className="flex items-center gap-2">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{
              background:
                i < step ? "var(--color-accent)" : "var(--color-ink-700)",
            }}
          />
        ))}
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
        Step {step} of {total}
      </p>
      <h1 className="text-lg font-semibold">{title}</h1>
    </>
  );
}

function GuideBlock({
  title,
  tone,
  children,
}: {
  title: string;
  tone?: "warn";
  children: React.ReactNode;
}) {
  return (
    <section
      className="mt-5 rounded-lg border p-4"
      style={{
        borderColor:
          tone === "warn"
            ? "color-mix(in srgb, var(--color-warn) 35%, transparent)"
            : "var(--color-ink-700)",
        background:
          tone === "warn"
            ? "color-mix(in srgb, var(--color-warn) 6%, transparent)"
            : "var(--color-ink-850)",
      }}
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-300">{children}</ul>
    </section>
  );
}
