import { z } from "zod";
import { db } from "@/lib/db";
import { buildQuestionSet } from "@/lib/questions";
import {
  activeSession,
  attemptsUsed,
  isExpired,
  resolveLink,
  serveCurrentQuestion,
} from "@/lib/interview";
import { clientIpHash, fail, handleError, ok, rateLimit } from "@/lib/http";
import type { Blueprint } from "@/lib/blueprint";
import type { Difficulty } from "@/lib/ai/types";

export const maxDuration = 120;

const Body = z.object({
  consent: z.literal(true),
  sttAvailable: z.boolean(),
  faceModelLoaded: z.boolean(),
  objectModelLoaded: z.boolean().default(false),
  screen: z
    .object({
      width: z.number().int().nonnegative(),
      height: z.number().int().nonnegative(),
      displays: z.number().int().nonnegative().optional(),
      devicePixelRatio: z.number().optional(),
    })
    .optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    if (!rateLimit(`start:${clientIpHash(req)}`, 20, 60_000)) {
      return fail(429, "Too many requests.");
    }

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return fail(400, "Explicit consent is required to start the interview.");
    }

    const link = await resolveLink(token);

    // Resume an interrupted attempt rather than burning another one. This runs
    // before the ACTIVE check so a single-attempt link, which is marked CONSUMED
    // the moment it is opened, can still be resumed after a browser crash.
    const existing = activeSession(link);
    if (existing) {
      if (isExpired(existing)) {
        await db.interviewSession.update({
          where: { id: existing.id },
          data: { status: "SUBMITTED", endedAt: new Date() },
        });
        return fail(410, "Your time for this interview has run out.");
      }
      const question = await serveCurrentQuestion(existing.id);
      if (!question) {
        return ok({ sessionId: existing.id, done: true });
      }
      return ok({
        sessionId: existing.id,
        deadlineAt: existing.deadlineAt?.toISOString() ?? null,
        question,
        resumed: true,
      });
    }

    if (link.status !== "ACTIVE") return fail(403, "This link is no longer active.");
    if (attemptsUsed(link) >= link.maxAttempts) {
      return fail(409, "This interview has already been taken.");
    }

    const now = new Date();
    const session = await db.interviewSession.create({
      data: {
        linkId: link.id,
        status: "IN_PROGRESS",
        consentAt: now,
        startedAt: now,
        deadlineAt: new Date(now.getTime() + link.durationSec * 1000),
        userAgent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
        ipHash: clientIpHash(req),
        screenInfo: parsed.data.screen ?? undefined,
        sttAvailable: parsed.data.sttAvailable,
        faceModelLoaded: parsed.data.faceModelLoaded,
        objectModelLoaded: parsed.data.objectModelLoaded,
      },
    });

    const set = await buildQuestionSet({
      domainId: link.domainId,
      domainName: link.domain.name,
      domainBlurb: link.domain.blurb,
      difficulty: link.difficulty as Difficulty,
      blueprint: link.blueprint as unknown as Blueprint,
      seed: session.id,
    });

    if (set.questions.length === 0) {
      await db.interviewSession.update({
        where: { id: session.id },
        data: { status: "TERMINATED", endedAt: new Date() },
      });
      return fail(500, "No questions are configured for this role. Contact the recruiter.");
    }

    await db.sessionQuestion.createMany({
      data: set.questions.map((q, i) => ({
        sessionId: session.id,
        order: i,
        type: q.type,
        answerMode: q.answerMode,
        prompt: q.prompt,
        rubric: q.rubric as unknown as object,
        options: q.options.length ? (q.options as unknown as object) : undefined,
        correctIndex: q.type === "MCQ" ? q.correctIndex : null,
        explanation: q.explanation || null,
        timeLimitSec: q.timeLimitSec,
      })),
    });

    if (!parsed.data.faceModelLoaded) {
      await db.proctorEvent.create({
        data: { sessionId: session.id, type: "MODEL_UNAVAILABLE", severity: 1 },
      });
    }
    if ((parsed.data.screen?.displays ?? 1) > 1) {
      await db.proctorEvent.create({
        data: {
          sessionId: session.id,
          type: "MULTI_DISPLAY",
          severity: 2,
          meta: { displays: parsed.data.screen?.displays },
        },
      });
    }

    if (link.maxAttempts === 1) {
      await db.interviewLink.update({ where: { id: link.id }, data: { status: "CONSUMED" } });
    }

    const question = await serveCurrentQuestion(session.id);
    return ok({
      sessionId: session.id,
      deadlineAt: session.deadlineAt?.toISOString() ?? null,
      question,
      questionSource: set.source,
    });
  } catch (err) {
    return handleError(err);
  }
}
