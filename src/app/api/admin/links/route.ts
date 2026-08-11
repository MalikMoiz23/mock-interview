import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { generateToken, hashToken } from "@/lib/crypto";
import { BlueprintSchema, blueprintTotal } from "@/lib/blueprint";
import { bankCoverage } from "@/lib/questions";
import { fail, handleError, ok } from "@/lib/http";

const CreateBody = z.object({
  domainId: z.string().min(1),
  candidateName: z.string().min(1).max(120),
  candidateEmail: z.string().email().max(200),
  difficulty: z.enum(["BEGINNER", "JUNIOR", "MID", "SENIOR", "STAFF"]),
  blueprint: BlueprintSchema,
  durationMinutes: z.number().int().min(5).max(180),
  expiresInDays: z.number().int().min(1).max(30),
  maxAttempts: z.number().int().min(1).max(3),
});

export async function GET() {
  try {
    const user = await requireUser();
    const links = await db.interviewLink.findMany({
      where: { orgId: user.orgId },
      orderBy: { createdAt: "desc" },
      include: {
        domain: { select: { name: true } },
        sessions: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            startedAt: true,
            endedAt: true,
            score: { select: { overall: true, integrityScore: true, recommendation: true } },
          },
        },
      },
    });
    return ok({ links });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const parsed = CreateBody.safeParse(await req.json());
    if (!parsed.success) {
      return fail(400, parsed.error.issues[0]?.message ?? "Invalid request");
    }
    const b = parsed.data;

    if (blueprintTotal(b.blueprint) === 0) {
      return fail(400, "An interview needs at least one question.");
    }

    // The domain must be global or owned by this org.
    const domain = await db.domain.findFirst({
      where: { id: b.domainId, OR: [{ orgId: null }, { orgId: user.orgId }] },
    });
    if (!domain) return fail(404, "Unknown domain.");

    const coverage = await bankCoverage(domain.id, b.difficulty, b.blueprint);

    const token = generateToken();

    const link = await db.interviewLink.create({
      data: {
        orgId: user.orgId,
        domainId: domain.id,
        createdById: user.id,
        tokenHash: hashToken(token),
        tokenPreview: token.slice(0, 8),
        candidateName: b.candidateName,
        candidateEmail: b.candidateEmail.toLowerCase(),
        difficulty: b.difficulty,
        blueprint: b.blueprint,
        durationSec: b.durationMinutes * 60,
        maxAttempts: b.maxAttempts,
        expiresAt: new Date(Date.now() + b.expiresInDays * 86_400_000),
      },
    });

    // The raw token is returned exactly once. Only its hash is stored.
    return ok({
      link: { id: link.id, tokenPreview: link.tokenPreview, expiresAt: link.expiresAt },
      url: `${env.appBaseUrl}/interview/${token}`,
      coverage,
    });
  } catch (err) {
    return handleError(err);
  }
}
