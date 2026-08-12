import { QUESTION_TYPES, QUESTION_TYPE_META, type Blueprint } from "./blueprint";
import type { QuestionType } from "./ai/types";

/**
 * A section is one contiguous run of questions of the same type.
 *
 * Sections exist so the interview reads like a real paper rather than a
 * conveyor belt: the candidate answers all the multiple choice, reviews it,
 * commits, and moves on. Within a section they can go back, change an answer,
 * or skip. Once a section is submitted it is closed — that boundary is what
 * keeps the interview fair when questions get progressively harder, and it is
 * enforced on the server, not in the browser.
 */

export type SectionPlan = {
  index: number;
  type: QuestionType;
  title: string;
  /** What the candidate is told before they start it. */
  instructions: string;
  count: number;
};

export const SECTION_INSTRUCTIONS: Record<QuestionType, string> = {
  MCQ: "Pick the single best answer for each question. You can move between questions and change your answers freely until you submit the section. There is no penalty for a wrong answer, so do not leave anything blank.",
  CONCEPTUAL:
    "Answer these out loud. Your speech is transcribed as you talk, and you can pause to correct the transcript before moving on. Aim for a minute or two per question.",
  SCENARIO:
    "Each of these describes a realistic situation. Write how you would approach it — your reasoning matters more than length. Pasting is disabled.",
  CODING:
    "Write your answer by hand. There is no editor, no autocomplete and nothing runs, so working code matters less than clear, correct thinking. Comment on anything you would check or handle.",
  BEHAVIORAL:
    "Answer these out loud, drawing on things you have actually done. Specific beats impressive: a real situation you handled tells us more than a polished summary.",
};

/** Derives the ordered sections a blueprint produces. */
export function planSections(blueprint: Blueprint): SectionPlan[] {
  const sections: SectionPlan[] = [];
  for (const type of QUESTION_TYPES) {
    const count = blueprint[type] ?? 0;
    if (count === 0) continue;
    sections.push({
      index: sections.length,
      type,
      title: QUESTION_TYPE_META[type].label,
      instructions: SECTION_INSTRUCTIONS[type],
      count,
    });
  }
  return sections;
}

/**
 * Assigns a section index to each question of an already-ordered paper.
 * The paper is ordered easiest-type-first, so a change of type is a boundary.
 */
export function assignSections<T extends { type: QuestionType }>(
  questions: T[],
): Array<T & { sectionIndex: number }> {
  let sectionIndex = -1;
  let previousType: QuestionType | null = null;
  return questions.map((q) => {
    if (q.type !== previousType) {
      sectionIndex += 1;
      previousType = q.type;
    }
    return { ...q, sectionIndex };
  });
}
