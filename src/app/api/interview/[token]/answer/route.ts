import { z } from "zod";
import { db } from "@/lib/db";
import { activeSession, isExpired, resolveLink, serveCurrentQuestion } from "@/lib/interview";
import { clientIpHash, fail, handleError, ok, rateLimit } from "@/lib/http";

const TelemetrySchema = z.object({
  keystrokes: z.number().int().nonnegative(),
  chars: z.number().int().nonnegative(),
  pastes: z.number().int().nonnegative(),
  maxBurstCps: z.number().nonnegative(),
  meanIkiMs: z.number().nonnegative(),
  idleMs: z.number().nonnegative(),
  backspaces: z.number().int().nonnegative(),
});

const Body = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
  answerText: z.string().max(20_000),
  spokenMs: z.number().int().nonnegative().max(3_600_000),
  /** MCQ only. Null means the candidate skipped it. */
  selectedIndex: z.number().int().min(0).max(9).nullable().default(null),
  /** True when a spoken transcript was hand-corrected. Permitted. */
  transcriptEdited: z.boolean().default(false),
  telemetry: TelemetrySchema.nullable(),
});

/** Long silence then a fluent burst is the signature of reading an answer aloud. */
function pacingAnomaly(answerText: string, spokenMs: number): boolean {
  const words = answerText.trim().split(/\s+/).filter(Boolean).length;
  if (words < 40) return false;
  if (spokenMs < 5_000) return true; // lots of text, almost no detected speech
  const wpm = words / (spokenMs / 60_000);
  return wpm > 230; // sustained delivery well above conversational speech
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    if (!rateLimit(`answer:${clientIpHash(req)}`, 60, 60_000)) {
      return fail(429, "Too many requests.");
    }

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return fail(400, "Malformed answer submission.");
    const b = parsed.data;

    const link = await resolveLink(token);
    const session = activeSession(link);
    if (!session || session.id !== b.sessionId) {
      return fail(409, "This interview session is no longer open.");
    }

    if (isExpired(session)) {
      await db.interviewSession.update({
        where: { id: session.id },
        data: { status: "SUBMITTED", endedAt: new Date() },
      });
      return fail(410, "Your time has run out. The interview has been submitted.");
    }

    const question = await db.sessionQuestion.findFirst({
      where: { id: b.questionId, sessionId: session.id },
    });
    if (!question) return fail(404, "Unknown question.");
    if (question.submittedAt) return fail(409, "This question was already answered.");

    // Server-side elapsed time. A tampered client clock changes nothing here.
    const servedAt = question.servedAt ?? new Date();
    const elapsedSec = Math.round((Date.now() - servedAt.getTime()) / 1000);

    // An out-of-range choice would silently grade as wrong, so reject it.
    const optionCount = ((question.options as unknown as string[]) ?? []).length;
    if (question.type === "MCQ" && b.selectedIndex !== null && b.selectedIndex >= optionCount) {
      return fail(400, "That option does not exist.");
    }

    await db.sessionQuestion.update({
      where: { id: question.id },
      data: {
        answerText: question.type === "MCQ" ? "" : b.answerText,
        selectedIndex: question.type === "MCQ" ? b.selectedIndex : null,
        spokenMs: b.spokenMs,
        transcriptEdited: b.transcriptEdited,
        telemetry: (b.telemetry ?? undefined) as unknown as object | undefined,
        submittedAt: new Date(),
      },
    });

    if (b.transcriptEdited) {
      // Recorded for transparency, weighted at zero. Correcting a bad
      // transcription is expected behaviour, not evidence of anything.
      await db.proctorEvent.create({
        data: {
          sessionId: session.id,
          type: "TRANSCRIPT_EDITED",
          severity: 1,
          meta: { questionOrder: question.order },
        },
      });
    }

    // Pacing check applies to spoken answers only; typed answers are covered by
    // keystroke telemetry recorded on the client.
    if (question.answerMode === "SPOKEN" && pacingAnomaly(b.answerText, b.spokenMs)) {
      await db.proctorEvent.create({
        data: {
          sessionId: session.id,
          type: "ANSWER_PACING_ANOMALY",
          severity: 2,
          meta: { questionOrder: question.order, spokenMs: b.spokenMs, chars: b.answerText.length },
        },
      });
    }

    if (b.telemetry && b.telemetry.maxBurstCps > 25 && b.telemetry.chars > 200) {
      await db.proctorEvent.create({
        data: {
          sessionId: session.id,
          type: "KEYSTROKE_BURST",
          severity: 3,
          meta: { questionOrder: question.order, maxBurstCps: b.telemetry.maxBurstCps },
        },
      });
    }

    const next = await serveCurrentQuestion(session.id);
    return ok({
      done: next === null,
      question: next,
      elapsedSec,
      overtime: elapsedSec > question.timeLimitSec,
    });
  } catch (err) {
    return handleError(err);
  }
}
