import { QUESTION_TYPES, QUESTION_TYPE_META, type QuestionTypeName } from "../blueprint";
import type {
  AIProvider,
  AnswerScore,
  GenerateQuestionsInput,
  GeneratedQuestion,
  QuestionType,
  Rubric,
  ScoreAnswerInput,
  SessionSummary,
  SummariseInput,
} from "./types";

/**
 * Deterministic offline provider.
 *
 * It is a rubric-coverage heuristic, not a language model: it measures how much
 * of each rubric criterion the answer visibly touches, weighted by how much
 * substance the answer has. Same input always produces the same score, which
 * makes it usable for tests and demos — but it cannot judge correctness,
 * reasoning quality, or whether an answer is actually right. Do not ship
 * hiring decisions on it. Run Ollama and set AI_PROVIDER=ollama instead.
 *
 * MCQ answers never reach this class — they are graded by exact match in
 * `gradeMcq`, which is objective regardless of provider.
 */

const WORD_RE = /[a-z0-9+#._-]+/gi;

function words(text: string): string[] {
  return text.toLowerCase().match(WORD_RE) ?? [];
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

/** Fraction of a criterion's keywords that appear in the answer. */
function keywordCoverage(answer: string, keywords: string[]): number {
  if (keywords.length === 0) return 0.5;
  const haystack = ` ${answer.toLowerCase()} `;
  let hits = 0;
  for (const kw of keywords) {
    const needle = kw.toLowerCase().trim();
    if (needle.length === 0) continue;
    if (haystack.includes(needle)) hits += 1;
  }
  return hits / keywords.length;
}

/** How much material there is to judge, 0..1, saturating at `target` words. */
function substance(wordCount: number, target: number): number {
  if (wordCount <= 0) return 0;
  return Math.min(1, Math.sqrt(wordCount / target));
}

const DIFFICULTY_TARGET_WORDS: Record<string, number> = {
  BEGINNER: 45,
  JUNIOR: 70,
  MID: 110,
  SENIOR: 150,
  STAFF: 180,
};

/** Answers of different shapes need different length expectations. */
const TYPE_LENGTH_FACTOR: Record<QuestionType, number> = {
  MCQ: 0.1,
  CONCEPTUAL: 0.55,
  SCENARIO: 1,
  CODING: 0.6,
  BEHAVIORAL: 1,
};

const GENERIC_RUBRIC: Rubric = {
  criteria: [
    { key: "relevance", label: "Directly addresses the question", weight: 2, keywords: [] },
    { key: "depth", label: "Goes beyond surface level", weight: 2, keywords: [] },
    {
      key: "reasoning",
      label: "Explains the reasoning, not just the conclusion",
      weight: 1,
      keywords: ["because", "so that", "instead", "trade-off", "however"],
    },
  ],
};

export class MockProvider implements AIProvider {
  readonly name = "mock";
  readonly model = "rubric-coverage-v2";
  readonly preferBank = true;

  async generateQuestions(input: GenerateQuestionsInput): Promise<GeneratedQuestion[]> {
    // Last-resort synthetic set. The curated bank in the database is preferred;
    // this only fires when the bank has nothing for the domain/difficulty.
    const out: GeneratedQuestion[] = [];
    const level = input.difficulty.toLowerCase();

    const PROMPTS: Record<QuestionTypeName, string> = {
      MCQ: `Which statement about ${input.domainName} is correct?`,
      CONCEPTUAL: `Explain one core idea in ${input.domainName} in your own words, and say when you would not use it.`,
      SCENARIO: `A ${level}-level ${input.domainName} project is behind schedule and quality is slipping. Describe how you would diagnose the cause and what you would change first.`,
      CODING: `Complete a small, realistic ${input.domainName} task of your choosing. Show the work and comment on the edge cases you handle.`,
      BEHAVIORAL: `Describe a ${level}-level problem you solved in ${input.domainName}. Cover the situation, what you decided, and what you would do differently now.`,
    };

    for (const type of QUESTION_TYPES) {
      const count = input.blueprint[type] ?? 0;
      for (let i = 0; i < count; i++) {
        const isMcq = type === "MCQ";
        out.push({
          type,
          answerMode: QUESTION_TYPE_META[type].mode,
          prompt: PROMPTS[type],
          rubric: isMcq ? { criteria: [] } : GENERIC_RUBRIC,
          timeLimitSec: isMcq ? 60 : type === "CODING" ? 420 : 240,
          options: isMcq
            ? [
                "It is always the fastest option.",
                "It depends on the constraints of the specific project.",
                "It is never used in production.",
                "It removes the need for testing.",
              ]
            : [],
          correctIndex: isMcq ? 1 : -1,
          explanation: isMcq
            ? "Engineering choices are constraint-dependent; absolute claims are the giveaway."
            : "",
        });
      }
    }
    return out;
  }

  async scoreAnswer(input: ScoreAnswerInput): Promise<AnswerScore> {
    const answer = input.answerText ?? "";
    const wordCount = words(answer).length;
    const target =
      (DIFFICULTY_TARGET_WORDS[input.difficulty] ?? 110) * TYPE_LENGTH_FACTOR[input.type];
    const sub = substance(wordCount, target);

    const criteria = input.rubric.criteria.length
      ? input.rubric.criteria
      : GENERIC_RUBRIC.criteria;

    const criterionScores = criteria.map((c) => {
      const coverage = keywordCoverage(answer, c.keywords);
      const raw = 100 * (0.6 * coverage + 0.4 * sub);
      const note =
        coverage >= 0.6
          ? "Covers the expected signals."
          : coverage > 0
            ? "Touches this only partially."
            : "No evidence of this in the answer.";
      return { key: c.key, score: clamp(raw), note };
    });

    const totalWeight = criteria.reduce((s, c) => s + (c.weight || 1), 0);
    const weighted =
      criteria.reduce(
        (sum, c, i) => sum + (c.weight || 1) * criterionScores[i].score,
        0,
      ) / (totalWeight || 1);

    const minWords =
      input.type === "CODING" ? 12 : input.type === "CONCEPTUAL" ? 10 : 15;
    const answeredSubstantively =
      input.type === "CODING" ? answer.trim().length >= 60 : wordCount >= minWords;

    const strengths = criterionScores
      .filter((c) => c.score >= 65)
      .map((c) => `Solid on: ${criteria.find((k) => k.key === c.key)?.label ?? c.key}`);

    const concerns: string[] = criterionScores
      .filter((c) => c.score < 40)
      .map((c) => `Weak on: ${criteria.find((k) => k.key === c.key)?.label ?? c.key}`);

    if (!answeredSubstantively) concerns.push("Answer was too short to assess.");
    if (input.telemetry && input.telemetry.pastes > 0) {
      concerns.push(`${input.telemetry.pastes} paste event(s) recorded on this answer.`);
    }
    if (input.answerMode === "SPOKEN" && input.spokenMs < 10_000 && wordCount > 60) {
      concerns.push("Transcript is long relative to detected speech time.");
    }

    return {
      score: clamp(answeredSubstantively ? weighted : weighted * 0.4),
      criterionScores,
      summary: answeredSubstantively
        ? `Offline heuristic: ${clamp(weighted)}/100 based on rubric keyword coverage across ${wordCount} words.`
        : "Offline heuristic: answer too short to assess.",
      strengths,
      concerns,
      answeredSubstantively,
    };
  }

  async summarise(input: SummariseInput): Promise<SessionSummary> {
    const scored = input.perQuestion;
    if (scored.length === 0) {
      return {
        overall: 0,
        dimensions: { technical: 0, problemSolving: 0, communication: 0, depth: 0 },
        recommendation: "NO",
        rationale: "No answers were submitted.",
        strengths: [],
        concerns: ["Interview produced no answers."],
      };
    }

    const avg = (xs: number[]) =>
      xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;
    const byType = (...types: QuestionType[]) =>
      scored.filter((q) => types.includes(q.type)).map((q) => q.score.score);

    const all = scored.map((q) => q.score.score);
    const overall = avg(all);

    const technical = byType("MCQ", "CODING");
    const problemSolving = byType("SCENARIO", "CODING");
    const communication = byType("BEHAVIORAL", "CONCEPTUAL");
    const depth = byType("SCENARIO", "BEHAVIORAL", "CONCEPTUAL");

    const dimensions = {
      technical: technical.length ? avg(technical) : overall,
      problemSolving: problemSolving.length ? avg(problemSolving) : overall,
      communication: communication.length ? avg(communication) : overall,
      depth: depth.length ? avg(depth) : overall,
    };

    const recommendation: SessionSummary["recommendation"] =
      overall >= 80 ? "STRONG_YES" : overall >= 65 ? "YES" : overall >= 45 ? "BORDERLINE" : "NO";

    const mcq = byType("MCQ");
    const mcqNote = mcq.length
      ? ` Multiple choice: ${mcq.filter((s) => s === 100).length}/${mcq.length} correct.`
      : "";

    return {
      overall,
      dimensions,
      recommendation,
      rationale: `Offline heuristic across ${scored.length} answers for a ${input.difficulty} ${input.domainName} role.${mcqNote} Written and spoken answers were scored by keyword coverage, not by correctness — read the transcripts before acting on this.`,
      strengths: [...new Set(scored.flatMap((q) => q.score.strengths))].slice(0, 5),
      concerns: [...new Set(scored.flatMap((q) => q.score.concerns))].slice(0, 5),
    };
  }
}
