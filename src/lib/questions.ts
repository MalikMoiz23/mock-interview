import { db } from "./db";
import { getProvider } from "./ai";
import { QUESTION_TYPES, blueprintTotal, type Blueprint } from "./blueprint";
import type { Difficulty, GeneratedQuestion, QuestionType, Rubric } from "./ai/types";

/** Difficulties to fall back to, in order, when the exact band is empty. */
const NEIGHBOURS: Record<Difficulty, Difficulty[]> = {
  BEGINNER: ["BEGINNER", "JUNIOR"],
  JUNIOR: ["JUNIOR", "BEGINNER", "MID"],
  MID: ["MID", "SENIOR", "JUNIOR"],
  SENIOR: ["SENIOR", "STAFF", "MID"],
  STAFF: ["STAFF", "SENIOR"],
};

/** Deterministic shuffle so a given seed always yields the same paper. */
function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const j = Math.abs(h) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

async function fromBank(
  domainId: string,
  difficulty: Difficulty,
  type: QuestionType,
  count: number,
  seed: string,
): Promise<GeneratedQuestion[]> {
  if (count <= 0) return [];
  const rows = await db.questionTemplate.findMany({
    where: { domainId, type, difficulty: { in: NEIGHBOURS[difficulty] } },
  });
  // Prefer exact-difficulty matches, then neighbours.
  const exact = rows.filter((r) => r.difficulty === difficulty);
  const rest = rows.filter((r) => r.difficulty !== difficulty);
  const ordered = [...seededShuffle(exact, seed + type), ...seededShuffle(rest, seed + type)];

  return ordered.slice(0, count).map((r) => ({
    type: r.type,
    answerMode: r.answerMode,
    prompt: r.prompt,
    rubric: (r.rubric as unknown as Rubric) ?? { criteria: [] },
    timeLimitSec: r.timeLimitSec,
    options: (r.options as unknown as string[]) ?? [],
    correctIndex: r.correctIndex ?? -1,
    explanation: r.explanation ?? "",
  }));
}

export type QuestionSetResult = {
  questions: GeneratedQuestion[];
  source: "ai" | "bank" | "mixed" | "synthetic";
  note?: string;
};

/** What the curated bank can actually serve for a given paper. */
export type BankCoverage = {
  /** Curated questions available for the requested blueprint. */
  curated: number;
  /** Requested total. */
  requested: number;
  /** Per-type shortfall against the blueprint. */
  shortfall: Partial<Record<QuestionType, number>>;
  /** Curated questions of other types that can stand in for the shortfall. */
  substitutes: number;
};

/**
 * Tells the recruiter, before they send a link, how much of the paper comes
 * from vetted questions. Cheap enough to call on every form change.
 */
export async function bankCoverage(
  domainId: string,
  difficulty: Difficulty,
  blueprint: Blueprint,
): Promise<BankCoverage> {
  const rows = await db.questionTemplate.findMany({
    where: { domainId, difficulty: { in: NEIGHBOURS[difficulty] } },
    select: { type: true },
  });
  const stock = new Map<QuestionType, number>();
  for (const r of rows) stock.set(r.type, (stock.get(r.type) ?? 0) + 1);

  let curated = 0;
  let leftover = 0;
  const shortfall: Partial<Record<QuestionType, number>> = {};

  for (const type of QUESTION_TYPES) {
    const want = blueprint[type] ?? 0;
    const have = stock.get(type) ?? 0;
    const used = Math.min(want, have);
    curated += used;
    leftover += have - used;
    if (want > have) shortfall[type] = want - have;
  }

  const missing = Object.values(shortfall).reduce((a, b) => a + (b ?? 0), 0);
  return {
    curated,
    requested: blueprintTotal(blueprint),
    shortfall,
    substitutes: Math.min(missing, leftover),
  };
}

/** Ordered easiest-first so the candidate warms up before the hard questions. */
function orderPaper(questions: GeneratedQuestion[]): GeneratedQuestion[] {
  const rank = new Map(QUESTION_TYPES.map((t, i) => [t, i]));
  return [...questions].sort(
    (a, b) => (rank.get(a.type) ?? 99) - (rank.get(b.type) ?? 99),
  );
}

/**
 * Builds the question set for a session.
 *
 * With a real LLM provider, questions are generated live so two candidates for
 * the same role never see an identical paper. With the mock provider, the
 * curated bank is used. Either way the other path is the fallback, and the
 * synthetic generator is the last resort so an interview never starts empty.
 */
export async function buildQuestionSet(input: {
  domainId: string;
  domainName: string;
  domainBlurb: string;
  difficulty: Difficulty;
  blueprint: Blueprint;
  seed: string;
}): Promise<QuestionSetResult> {
  const provider = getProvider();
  if (blueprintTotal(input.blueprint) === 0) return { questions: [], source: "bank" };

  if (provider.name !== "mock") {
    try {
      const generated = await provider.generateQuestions({
        domainName: input.domainName,
        domainBlurb: input.domainBlurb,
        difficulty: input.difficulty,
        blueprint: input.blueprint,
      });
      const complete = QUESTION_TYPES.every(
        (t) =>
          generated.filter((q) => q.type === t).length >= (input.blueprint[t] ?? 0),
      );
      if (complete) {
        const trimmed = QUESTION_TYPES.flatMap((t) =>
          generated.filter((q) => q.type === t).slice(0, input.blueprint[t] ?? 0),
        );
        return { questions: orderPaper(trimmed), source: "ai" };
      }
    } catch (err) {
      console.error("[questions] Live generation failed, using bank:", (err as Error).message);
    }
  }

  // Bank pass.
  const banked: GeneratedQuestion[] = [];
  const missing: Partial<Record<QuestionType, number>> = {};
  for (const type of QUESTION_TYPES) {
    const want = input.blueprint[type] ?? 0;
    const got = await fromBank(input.domainId, input.difficulty, type, want, input.seed);
    banked.push(...got);
    if (got.length < want) missing[type] = want - got.length;
  }

  let shortfall = Object.values(missing).reduce((a, b) => a + (b ?? 0), 0);
  if (shortfall === 0) return { questions: orderPaper(banked), source: "bank" };

  // Substitute before generating. A real vetted question of a different type
  // beats a generically generated one of the right type, and with the mock
  // provider the generated filler is genuinely poor. Only the type mix bends;
  // the paper length and the domain do not.
  const used = new Set(banked.map((q) => q.prompt));
  const spare = await db.questionTemplate.findMany({
    where: {
      domainId: input.domainId,
      difficulty: { in: NEIGHBOURS[input.difficulty] },
      prompt: { notIn: [...used] },
    },
  });
  const substitutes = seededShuffle(spare, input.seed + "sub")
    .slice(0, shortfall)
    .map((r) => ({
      type: r.type,
      answerMode: r.answerMode,
      prompt: r.prompt,
      rubric: (r.rubric as unknown as Rubric) ?? { criteria: [] },
      timeLimitSec: r.timeLimitSec,
      options: (r.options as unknown as string[]) ?? [],
      correctIndex: r.correctIndex ?? -1,
      explanation: r.explanation ?? "",
    }));
  banked.push(...substitutes);
  shortfall -= substitutes.length;

  if (shortfall === 0) {
    return {
      questions: orderPaper(banked),
      source: "bank",
      note:
        substitutes.length > 0
          ? `${substitutes.length} question(s) were substituted from other types in this domain because the requested mix was not fully stocked.`
          : undefined,
    };
  }

  // Still short: generate the remainder so a thin bank never shortens the paper.
  const fillerBlueprint = { ...input.blueprint };
  for (const type of QUESTION_TYPES) fillerBlueprint[type] = 0;
  // Ask for the remainder as the type that was most short.
  const worstType =
    (Object.entries(missing).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0] as
      | QuestionType
      | undefined) ?? "CONCEPTUAL";
  fillerBlueprint[worstType] = shortfall;

  let filler: GeneratedQuestion[] = [];
  try {
    filler = await provider.generateQuestions({
      domainName: input.domainName,
      domainBlurb: input.domainBlurb,
      difficulty: input.difficulty,
      blueprint: fillerBlueprint,
    });
  } catch (err) {
    console.error("[questions] Gap fill failed:", (err as Error).message);
  }

  return {
    questions: orderPaper([...banked, ...filler.slice(0, shortfall)]),
    source: banked.length > 0 ? "mixed" : "synthetic",
    note: `The curated bank was short by ${shortfall} question(s) for ${input.domainName} at ${input.difficulty}; those were generated.`,
  };
}
