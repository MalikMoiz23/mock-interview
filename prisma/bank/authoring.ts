import type { BankQuestion, Criterion } from "../question-bank";

/**
 * Shared authoring helpers for the depth tranche.
 *
 * The three earlier bank files each redefined these privately. Ten more files
 * doing the same would be ten more places for the time limits to drift apart,
 * so this tranche imports them.
 */

/** Multiple choice. Auto-graded by exact match, so it carries no rubric. */
export const mcq = (
  difficulty: BankQuestion["difficulty"],
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
): BankQuestion => ({
  type: "MCQ",
  answerMode: "CHOICE",
  difficulty,
  prompt,
  timeLimitSec: 60,
  criteria: [],
  options,
  correctIndex,
  explanation,
});

/** Spoken: CONCEPTUAL explains the field, BEHAVIORAL draws on experience. */
export const spoken = (
  type: "CONCEPTUAL" | "BEHAVIORAL",
  difficulty: BankQuestion["difficulty"],
  prompt: string,
  criteria: Criterion[],
): BankQuestion => ({
  type,
  answerMode: "SPOKEN",
  difficulty,
  prompt,
  timeLimitSec: type === "CONCEPTUAL" ? 150 : 240,
  criteria,
});

/** Typed: SCENARIO is a problem statement, CODING is a hands-on task. */
export const typed = (
  type: "SCENARIO" | "CODING",
  difficulty: BankQuestion["difficulty"],
  prompt: string,
  criteria: Criterion[],
): BankQuestion => ({
  type,
  answerMode: "TYPED",
  difficulty,
  prompt,
  timeLimitSec: type === "SCENARIO" ? 330 : 450,
  criteria,
});

/**
 * A rubric criterion. `keywords` are what the offline keyword scorer looks for;
 * the local model reads `label` instead, so both need to stand on their own.
 */
export const c = (
  key: string,
  label: string,
  weight: number,
  keywords: string[],
): Criterion => ({ key, label, weight, keywords });
