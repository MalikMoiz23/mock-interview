import { z } from "zod";
import { db } from "@/lib/db";
import {
  activeSession,
  isExpired,
  resolveLink,
  serveCurrentSection,
  sessionProgress,
} from "@/lib/interview";
import { clientIpHash, fail, handleError, ok, rateLimit } from "@/lib/http";

const Body = z.object({
  sessionId: z.string().min(1),
  /** Guards against a double-submit advancing two sections at once. */
  sectionIndex: z.number().int().min(0).max(20),
});

/** Long silence then a fluent burst is the signature of reading an answer aloud. */
function pacingAnomaly(answerText: string, spokenMs: number): boolean {
  const words = answerText.trim().split(/\s+/).filter(Boolean).length;
  if (words < 40) return false;
  if (spokenMs < 5_000) return true;
  return words / (spokenMs / 60_000) > 230;
}

/**
 * Finalises the current section and advances.
 *
 * This is the one-way door. Everything in the section is stamped submitted,
 * anything left blank is recorded as skipped rather than as a zero-length
 * answer, and the server's section pointer moves on. There is no endpoint that
 * moves it back.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    if (!rateLimit(`section:${clientIpHash(req)}`, 60, 60_000)) {
      return fail(429, "Too many requests.");
    }

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return fail(400, "Malformed request.");

    const link = await resolveLink(token);
    const session = activeSession(link);
    if (!session || session.id !== parsed.data.sessionId) {
      return fail(409, "This interview session is no longer open.");
    }

    if (isExpired(session)) {
      await db.interviewSession.update({
        where: { id: session.id },
        data: { status: "SUBMITTED", endedAt: new Date() },
      });
      return fail(410, "Your time has run out. The interview has been submitted.");
    }

    // A retried request for a section already submitted is not an error — the
    // first one won. Return the current state so the client resynchronises.
    if (parsed.data.sectionIndex !== session.currentSection) {
      const current = await serveCurrentSection(session.id);
      return ok({
        alreadySubmitted: true,
        done: current === null,
        section: current,
        progress: await sessionProgress(session.id),
      });
    }

    const questions = await db.sessionQuestion.findMany({
      where: { sessionId: session.id, sectionIndex: session.currentSection },
      orderBy: { order: "asc" },
    });

    const now = new Date();
    for (const q of questions) {
      const answered =
        q.type === "MCQ" ? q.selectedIndex !== null : q.answerText.trim().length > 0;

      await db.sessionQuestion.update({
        where: { id: q.id },
        data: { submittedAt: now, skipped: !answered },
      });

      if (!answered) continue;

      if (q.answerMode === "SPOKEN" && pacingAnomaly(q.answerText, q.spokenMs)) {
        await db.proctorEvent.create({
          data: {
            sessionId: session.id,
            type: "ANSWER_PACING_ANOMALY",
            severity: 2,
            meta: { questionOrder: q.order, spokenMs: q.spokenMs, chars: q.answerText.length },
          },
        });
      }

      const telemetry = q.telemetry as { maxBurstCps?: number; chars?: number } | null;
      if (telemetry && (telemetry.maxBurstCps ?? 0) > 25 && (telemetry.chars ?? 0) > 200) {
        await db.proctorEvent.create({
          data: {
            sessionId: session.id,
            type: "KEYSTROKE_BURST",
            severity: 3,
            meta: { questionOrder: q.order, maxBurstCps: telemetry.maxBurstCps },
          },
        });
      }
    }

    const updated = await db.interviewSession.update({
      where: { id: session.id },
      data: { currentSection: { increment: 1 } },
      select: { id: true },
    });

    const next = await serveCurrentSection(updated.id);
    return ok({
      done: next === null,
      section: next,
      skipped: questions.filter(
        (q) => (q.type === "MCQ" ? q.selectedIndex === null : q.answerText.trim() === ""),
      ).length,
      progress: await sessionProgress(session.id),
    });
  } catch (err) {
    return handleError(err);
  }
}
