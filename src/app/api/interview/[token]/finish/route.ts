import { z } from "zod";
import { db } from "@/lib/db";
import { activeSession, resolveLink } from "@/lib/interview";
import { gradeSession } from "@/lib/grading";
import { clientIpHash, fail, handleError, ok, rateLimit } from "@/lib/http";

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

    // Grading can take a minute against a real model, so it runs detached and
    // the candidate is released immediately. The admin view offers a manual
    // re-grade if this promise dies with the process.
    void gradeSession(session.id).catch((err) =>
      console.error("[finish] Background grading failed:", err),
    );

    return ok({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
