import { z } from "zod";
import { after } from "next/server";
import { db } from "@/lib/db";
import { activeSession, resolveLink } from "@/lib/interview";
import { gradeSession } from "@/lib/grading";
import { clientIpHash, fail, handleError, ok, rateLimit } from "@/lib/http";

// Grading runs inside this request's `after()` callback, so the handler's
// budget has to cover it, not just the few milliseconds the candidate waits.
export const maxDuration = 300;

const Body = z.object({
  sessionId: z.string().min(1),
  reason: z.enum(["completed", "time_expired", "abandoned"]).default("completed"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    if (!rateLimit(`finish:${clientIpHash(req)}`, 20, 60_000)) {
      return fail(429, "Too many requests.");
    }

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return fail(400, "Malformed request.");

    const link = await resolveLink(token);
    const session = activeSession(link);
    if (!session || session.id !== parsed.data.sessionId) {
      // Already finished — treat as success so a retried beacon is harmless.
      return ok({ ok: true, alreadyClosed: true });
    }

    await db.interviewSession.update({
      where: { id: session.id },
      data: {
        status: parsed.data.reason === "abandoned" ? "ABANDONED" : "SUBMITTED",
        endedAt: new Date(),
      },
    });

    // Grading takes around a minute per long-form answer against a local model,
    // so the candidate is released immediately and the work runs afterwards.
    //
    // This must be `after()`, not a bare floating promise. A promise left
    // dangling past the response is not guaranteed to be driven to completion —
    // the request scope can be torn down first, which silently loses the score
    // and leaves the session stuck on SUBMITTED. `after()` is the supported way
    // to keep post-response work alive.
    after(async () => {
      try {
        await gradeSession(session.id);
        console.log(`[finish] Graded session ${session.id}.`);
      } catch (err) {
        console.error("[finish] Background grading failed:", err);
      }
    });

    return ok({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
