import { z } from "zod";

export const QUESTION_TYPES = [
  "MCQ",
  "CONCEPTUAL",
  "SCENARIO",
  "CODING",
  "BEHAVIORAL",
] as const;

export type QuestionTypeName = (typeof QUESTION_TYPES)[number];

export const BlueprintSchema = z.object({
  MCQ: z.number().int().min(0).max(20),
  CONCEPTUAL: z.number().int().min(0).max(10),
  SCENARIO: z.number().int().min(0).max(10),
  CODING: z.number().int().min(0).max(10),
  BEHAVIORAL: z.number().int().min(0).max(10),
});

export type Blueprint = z.infer<typeof BlueprintSchema>;

export const EMPTY_BLUEPRINT: Blueprint = {
  MCQ: 0,
  CONCEPTUAL: 0,
  SCENARIO: 0,
  CODING: 0,
  BEHAVIORAL: 0,
};

export const QUESTION_TYPE_META: Record<
  QuestionTypeName,
  { label: string; blurb: string; mode: "CHOICE" | "TYPED" | "SPOKEN"; colorVar: string }
> = {
  MCQ: {
    label: "Multiple choice",
    blurb: "Auto-graded. Fast, objective, no AI needed. Good for fundamentals.",
    mode: "CHOICE",
    colorVar: "var(--color-good)",
  },
  CONCEPTUAL: {
    label: "About the field",
    blurb: "Spoken. Does the candidate understand the ideas behind the tools?",
    mode: "SPOKEN",
    colorVar: "var(--color-accent)",
  },
  SCENARIO: {
    label: "Problem statement",
    blurb: "Typed. A realistic situation to reason through in prose.",
    mode: "TYPED",
    colorVar: "var(--color-warn)",
  },
  CODING: {
    label: "Hands-on task",
    blurb: "Typed. Code, markup, a query, or a concrete design spec.",
    mode: "TYPED",
    colorVar: "var(--color-accent)",
  },
  BEHAVIORAL: {
    label: "Experience",
    blurb: "Spoken. A real situation the candidate handled.",
    mode: "SPOKEN",
    colorVar: "var(--color-ink-400)",
  },
};

/**
 * Default papers per seniority.
 *
 * A beginner sitting five open-ended questions will freeze and the result says
 * nothing useful, so the beginner paper leans on multiple choice and short
 * conceptual answers and skips open-ended coding entirely. Weight shifts to
 * judgement questions as seniority rises.
 */
export const DIFFICULTY_PRESETS: Record<
  string,
  { label: string; hint: string; blueprint: Blueprint; durationMinutes: number }
> = {
  BEGINNER: {
    label: "Beginner — student / first job",
    hint: "Mostly multiple choice with two short spoken answers. No open-ended coding.",
    blueprint: { MCQ: 6, CONCEPTUAL: 2, SCENARIO: 1, CODING: 0, BEHAVIORAL: 1 },
    durationMinutes: 25,
  },
  JUNIOR: {
    label: "Junior — 0-2 years",
    hint: "Fundamentals checked by MCQ, one small hands-on task.",
    blueprint: { MCQ: 4, CONCEPTUAL: 2, SCENARIO: 1, CODING: 1, BEHAVIORAL: 1 },
    durationMinutes: 35,
  },
  MID: {
    label: "Mid — 2-5 years",
    hint: "Balanced: judgement, one real task, one experience question.",
    blueprint: { MCQ: 3, CONCEPTUAL: 1, SCENARIO: 2, CODING: 2, BEHAVIORAL: 1 },
    durationMinutes: 45,
  },
  SENIOR: {
    label: "Senior — 5-9 years",
    hint: "Weighted to scenarios and experience. MCQs stop discriminating here.",
    blueprint: { MCQ: 1, CONCEPTUAL: 1, SCENARIO: 3, CODING: 2, BEHAVIORAL: 2 },
    durationMinutes: 55,
  },
  STAFF: {
    label: "Staff — 9+ years",
    hint: "Almost entirely judgement and lived experience.",
    blueprint: { MCQ: 0, CONCEPTUAL: 1, SCENARIO: 4, CODING: 1, BEHAVIORAL: 3 },
    durationMinutes: 60,
  },
};

export function blueprintTotal(b: Blueprint): number {
  return QUESTION_TYPES.reduce((sum, t) => sum + (b[t] ?? 0), 0);
}

/** Rough time budget, used to warn when a paper cannot fit its duration. */
export const TYPE_BUDGET_SEC: Record<QuestionTypeName, number> = {
  MCQ: 60,
  CONCEPTUAL: 150,
  SCENARIO: 330,
  CODING: 450,
  BEHAVIORAL: 240,
};

export function estimatedSeconds(b: Blueprint): number {
  return QUESTION_TYPES.reduce((sum, t) => sum + (b[t] ?? 0) * TYPE_BUDGET_SEC[t], 0);
}
