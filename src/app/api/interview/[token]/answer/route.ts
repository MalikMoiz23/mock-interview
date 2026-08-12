import { z } from "zod";
import { db } from "@/lib/db";
import { activeSession, isExpired, resolveLink } from "@/lib/interview";
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
  selectedIndex: z.number().int().min(0).max(9).nullable().default(null),
  transcriptEdited: z.boolean().default(false),
  telemetry: TelemetrySchema.nullable(),
});

/**
 * Saves a draft answer.
 *
 * Answers autosave as the candidate moves between questions, so a crashed tab
 * or a dropped connection costs nothing. Nothing here finalises anything —
 * `submittedAt` is set only when the section is submitted, which is what makes
 * "go back and change your answer" safe to offer.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    if (!rateLimit(`answer:${clientIpHash(req)}`, 240, 60_000)) {
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

    // The section pointer is the authority. A client that tries to write into
    // a submitted section — by replaying an old request or editing its own
    // state — is refused here rather than trusted.
    if (question.sectionIndex !== session.currentSection) {
      return fail(409, "That section has already been submitted.");
    }
    if (question.submittedAt) return fail(409, "This question is already submitted.");

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
        // Answering clears a previous skip.
        skipped: false,
      },
    });

    return ok({ saved: true });
  } catch (err) {
    return handleError(err);
  }
}
