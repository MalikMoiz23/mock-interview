import { resolveLink, attemptsUsed, activeSession } from "@/lib/interview";
import { blueprintTotal, type Blueprint } from "@/lib/blueprint";
import { clientIpHash, fail, handleError, ok, rateLimit } from "@/lib/http";

/**
 * Pre-flight info for the consent + device-check screens.
 * Deliberately returns no questions — the paper is never in the browser early.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    if (!rateLimit(`link:${clientIpHash(req)}`, 60, 60_000)) {
      return fail(429, "Too many requests.");
    }

    const link = await resolveLink(token);
    const used = attemptsUsed(link);
    const running = activeSession(link);

    if (used >= link.maxAttempts && !running) {
      return fail(409, "This interview has already been taken.");
    }

    const blueprint = link.blueprint as unknown as Blueprint;
    const spoken = (blueprint.CONCEPTUAL ?? 0) + (blueprint.BEHAVIORAL ?? 0);
    const typedCount = (blueprint.SCENARIO ?? 0) + (blueprint.CODING ?? 0);

    return ok({
      candidateName: link.candidateName,
      domain: link.domain.name,
      domainBlurb: link.domain.blurb,
      difficulty: link.difficulty,
      questionCount: blueprintTotal(blueprint),
      // Counts only, so the candidate knows what to expect. No prompts here.
      mcqCount: blueprint.MCQ ?? 0,
      spokenCount: spoken,
      typedCount,
      durationSec: link.durationSec,
      expiresAt: link.expiresAt.toISOString(),
      resumable: Boolean(running?.startedAt),
    });
  } catch (err) {
    return handleError(err);
  }
}
