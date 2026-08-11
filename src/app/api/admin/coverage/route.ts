import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { BlueprintSchema } from "@/lib/blueprint";
import { bankCoverage } from "@/lib/questions";
import { fail, handleError, ok } from "@/lib/http";
import { env } from "@/lib/env";

const Body = z.object({
  domainId: z.string().min(1),
  difficulty: z.enum(["BEGINNER", "JUNIOR", "MID", "SENIOR", "STAFF"]),
  blueprint: BlueprintSchema,
});

/**
 * Tells the recruiter, before they send the link, how much of this paper comes
 * from vetted questions versus generated ones. Without this they only find out
 * after a candidate has already sat the interview.
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return fail(400, "Invalid request.");

    const domain = await db.domain.findFirst({
      where: {
        id: parsed.data.domainId,
        OR: [{ orgId: null }, { orgId: user.orgId }],
      },
      select: { id: true },
    });
    if (!domain) return fail(404, "Unknown domain.");

    const coverage = await bankCoverage(
      domain.id,
      parsed.data.difficulty,
      parsed.data.blueprint,
    );

    return ok({
      ...coverage,
      // With the mock provider, anything not covered by the bank is generic
      // filler — worth warning about. With a real key it is a live question.
      generatedAreSynthetic: env.aiProvider === "mock",
    });
  } catch (err) {
    return handleError(err);
  }
}
