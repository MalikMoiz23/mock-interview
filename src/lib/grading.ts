import { db } from "./db";
import { getProvider } from "./ai";
import { gradeMcq } from "./ai/types";
import { computeIntegrity, needsHumanReview } from "./integrity";
import type {
  AnswerScore,
  AnswerTelemetry,
  Difficulty,
  QuestionType,
  Rubric,
  SessionSummary,
} from "./ai/types";
import type { Recommendation } from "@prisma/client";

/**
 * Grades a submitted session end-to-end and persists the result.
 * Safe to call twice: it re-grades and overwrites.
 */
export async function gradeSession(sessionId: string): Promise<void> {
  const session = await db.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      link: { include: { domain: true } },
      questions: { orderBy: { order: "asc" } },
      events: { select: { type: true, durationMs: true } },
    },
  });
  if (!session) throw new Error(`Session ${sessionId} not found`);

  const provider = getProvider();
  const difficulty = session.link.difficulty as Difficulty;
  const domainName = session.link.domain.name;

  const perQuestion: Array<{
    order: number;
    type: QuestionType;
    prompt: string;
    score: AnswerScore;
  }> = [];

  for (const q of session.questions) {
    let score: AnswerScore;

    // Multiple choice is exact-match; it never goes near a language model, so
    // it is objective, free, and identical across providers.
    if (q.type === "MCQ") {
      score = gradeMcq(q.selectedIndex, q.correctIndex ?? -1, q.explanation ?? "");
      await db.sessionQuestion.update({
        where: { id: q.id },
        data: { result: score as unknown as object },
      });
      perQuestion.push({ order: q.order, type: q.type, prompt: q.prompt, score });
      continue;
    }

    try {
      score = await provider.scoreAnswer({
        domainName,
        difficulty,
        type: q.type,
        answerMode: q.answerMode,
        prompt: q.prompt,
        rubric: q.rubric as unknown as Rubric,
        answerText: q.answerText,
        spokenMs: q.spokenMs,
        transcriptEdited: q.transcriptEdited,
        telemetry: (q.telemetry as unknown as AnswerTelemetry | null) ?? null,
      });
    } catch (err) {
      console.error(`[grading] Failed to score question ${q.id}:`, (err as Error).message);
      score = {
        score: 0,
        criterionScores: [],
        summary: "Automatic scoring failed for this answer — read the transcript directly.",
        strengths: [],
        concerns: ["Scoring error; this answer was not graded."],
        answeredSubstantively: q.answerText.trim().length > 0,
      };
    }

    await db.sessionQuestion.update({
      where: { id: q.id },
      data: { result: score as unknown as object },
    });

    perQuestion.push({ order: q.order, type: q.type, prompt: q.prompt, score });
  }

  let summary: SessionSummary;
  try {
    summary = await provider.summarise({ domainName, difficulty, perQuestion });
  } catch (err) {
    console.error("[grading] Summary failed, deriving from question scores:", (err as Error).message);
    const scores = perQuestion.map((q) => q.score.score);
    const avg = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    summary = {
      overall: avg,
      dimensions: { technical: avg, problemSolving: avg, communication: avg, depth: avg },
      recommendation: avg >= 65 ? "YES" : avg >= 45 ? "BORDERLINE" : "NO",
      rationale: "Summary generation failed; this is a plain average of the per-question scores.",
      strengths: [],
      concerns: ["Summary generation failed."],
    };
  }

  const integrity = computeIntegrity(session.events, {
    faceModelLoaded: session.faceModelLoaded,
    sttAvailable: session.sttAvailable,
    objectModelLoaded: session.objectModelLoaded,
  });

  // A weak integrity result does not lower the competence score — it routes the
  // result to a human instead, so a false positive costs a review, not a hire.
  const recommendation: Recommendation = needsHumanReview(integrity)
    ? "INTEGRITY_REVIEW"
    : (summary.recommendation as Recommendation);

  await db.sessionScore.upsert({
    where: { sessionId },
    create: {
      sessionId,
      overall: Math.round(summary.overall),
      dimensions: summary.dimensions as unknown as object,
      integrityScore: integrity.score,
      integrityFlags: integrity as unknown as object,
      recommendation,
      rationale: summary.rationale,
      strengths: summary.strengths as unknown as object,
      concerns: summary.concerns as unknown as object,
      provider: provider.name,
      model: provider.model,
    },
    update: {
      overall: Math.round(summary.overall),
      dimensions: summary.dimensions as unknown as object,
      integrityScore: integrity.score,
      integrityFlags: integrity as unknown as object,
      recommendation,
      rationale: summary.rationale,
      strengths: summary.strengths as unknown as object,
      concerns: summary.concerns as unknown as object,
      provider: provider.name,
      model: provider.model,
      scoredAt: new Date(),
    },
  });

  await db.interviewSession.update({
    where: { id: sessionId },
    data: { status: "SCORED" },
  });
}
