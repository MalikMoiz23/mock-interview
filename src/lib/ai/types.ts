import { z } from "zod";
import type { Blueprint } from "../blueprint";

export type Difficulty = "BEGINNER" | "JUNIOR" | "MID" | "SENIOR" | "STAFF";
export type QuestionType = "MCQ" | "CONCEPTUAL" | "SCENARIO" | "CODING" | "BEHAVIORAL";
export type AnswerMode = "CHOICE" | "TYPED" | "SPOKEN";

// --- Rubric ----------------------------------------------------------------

export const RubricCriterionSchema = z.object({
  key: z.string(),
  label: z.string(),
  /// Relative weight within the question. Weights are normalised at scoring time.
  weight: z.number(),
  /// Signals a strong answer touches. Used by the offline scorer; treated as
  /// guidance (not a checklist) by the LLM scorer.
  keywords: z.array(z.string()),
});

export const RubricSchema = z.object({
  criteria: z.array(RubricCriterionSchema),
});

export type Rubric = z.infer<typeof RubricSchema>;

// --- Question generation ---------------------------------------------------

export const GeneratedQuestionSchema = z.object({
  type: z.enum(["MCQ", "CONCEPTUAL", "SCENARIO", "CODING", "BEHAVIORAL"]),
  answerMode: z.enum(["CHOICE", "TYPED", "SPOKEN"]),
  prompt: z.string(),
  rubric: RubricSchema,
  timeLimitSec: z.number(),
  /// MCQ only. Exactly four options; empty for every other type.
  options: z.array(z.string()),
  /// MCQ only. Index into `options`; -1 for every other type.
  correctIndex: z.number(),
  /// MCQ only. Why the correct option is correct. Empty for other types.
  explanation: z.string(),
});

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema> & {
  /** Set when the question came from the curated bank, for usage rotation. */
  templateId?: string;
};

export type GenerateQuestionsInput = {
  domainName: string;
  domainBlurb: string;
  difficulty: Difficulty;
  blueprint: Blueprint;
};

// --- Answer scoring --------------------------------------------------------

export const AnswerScoreSchema = z.object({
  /// 0-100 for this single answer.
  score: z.number(),
  criterionScores: z.array(
    z.object({ key: z.string(), score: z.number(), note: z.string() }),
  ),
  /// One or two sentences a recruiter can read without the transcript.
  summary: z.string(),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  /// False when the answer is empty, off-topic, or a non-answer.
  answeredSubstantively: z.boolean(),
});

export type AnswerScore = z.infer<typeof AnswerScoreSchema>;

export type ScoreAnswerInput = {
  domainName: string;
  difficulty: Difficulty;
  type: QuestionType;
  answerMode: AnswerMode;
  prompt: string;
  rubric: Rubric;
  answerText: string;
  spokenMs: number;
  transcriptEdited: boolean;
  telemetry: AnswerTelemetry | null;
};

export type AnswerTelemetry = {
  keystrokes: number;
  chars: number;
  pastes: number;
  /// Peak characters-per-second over any 1s window. High values imply paste
  /// or automation rather than typing.
  maxBurstCps: number;
  /// Mean inter-keystroke interval in ms.
  meanIkiMs: number;
  idleMs: number;
  backspaces: number;
};

// --- Session summary -------------------------------------------------------

export const SessionSummarySchema = z.object({
  overall: z.number(),
  dimensions: z.object({
    technical: z.number(),
    problemSolving: z.number(),
    communication: z.number(),
    depth: z.number(),
  }),
  recommendation: z.enum(["STRONG_YES", "YES", "BORDERLINE", "NO"]),
  rationale: z.string(),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
});

export type SessionSummary = z.infer<typeof SessionSummarySchema>;

export type SummariseInput = {
  domainName: string;
  difficulty: Difficulty;
  perQuestion: Array<{
    order: number;
    type: QuestionType;
    prompt: string;
    score: AnswerScore;
  }>;
};

// --- Provider contract -----------------------------------------------------

export interface AIProvider {
  readonly name: string;
  readonly model: string;
  /**
   * True when the curated bank should be preferred over live generation.
   *
   * Grading against an explicit rubric and writing a good interview question
   * are different jobs. Small local models do the first well and the second
   * poorly — they drift toward generic, tutorial-grade questions. So local and
   * offline providers lean on the vetted bank for questions and are used where
   * they actually earn their keep: judging the answers.
   */
  readonly preferBank: boolean;
  generateQuestions(input: GenerateQuestionsInput): Promise<GeneratedQuestion[]>;
  scoreAnswer(input: ScoreAnswerInput): Promise<AnswerScore>;
  summarise(input: SummariseInput): Promise<SessionSummary>;
}

/** MCQ grading is exact-match and never goes near a language model. */
export function gradeMcq(
  selectedIndex: number | null,
  correctIndex: number,
  explanation: string,
): AnswerScore {
  const correct = selectedIndex !== null && selectedIndex === correctIndex;
  return {
    score: correct ? 100 : 0,
    criterionScores: [
      {
        key: "correct",
        score: correct ? 100 : 0,
        note: correct ? "Correct option selected." : "Incorrect option selected.",
      },
    ],
    summary: correct
      ? "Correct."
      : selectedIndex === null
        ? "No option selected."
        : `Incorrect. ${explanation}`.trim(),
    strengths: correct ? ["Answered correctly"] : [],
    concerns: correct ? [] : ["Answered incorrectly"],
    answeredSubstantively: selectedIndex !== null,
  };
}
