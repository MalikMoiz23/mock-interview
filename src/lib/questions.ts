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

function toGenerated(r: {
  id: string;
  type: QuestionType;
  answerMode: GeneratedQuestion["answerMode"];
  prompt: string;
  rubric: unknown;
  timeLimitSec: number;
  options: unknown;
  correctIndex: number | null;
  explanation: string | null;
}): GeneratedQuestion {
  return {
    templateId: r.id,
    type: r.type,
    answerMode: r.answerMode,
    prompt: r.prompt,
    rubric: (r.rubric as Rubric) ?? { criteria: [] },
    timeLimitSec: r.timeLimitSec,
    options: (r.options as string[]) ?? [],
    correctIndex: r.correctIndex ?? -1,
    explanation: r.explanation ?? "",
  };
}

/**
 * How many times each template has been served recently for this domain and
 * difficulty. Used to rotate the bank so two candidates interviewing for the
 * same role in the same week do not sit an identical paper — the single most
 * obvious way for questions to leak between applicants.
 */
type Usage = { count: number; lastServed: number };

async function recentUsage(
  domainId: string,
  difficulty: Difficulty,
): Promise<Map<string, Usage>> {
  const since = new Date(Date.now() - 60 * 86_400_000); // 60 days
  const rows = await db.sessionQuestion.findMany({
    where: {
      templateId: { not: null },
      session: { createdAt: { gte: since }, link: { domainId, difficulty } },
    },
    select: { templateId: true, servedAt: true, session: { select: { createdAt: true } } },
  });
  const usage = new Map<string, Usage>();
  for (const r of rows) {
    if (!r.templateId) continue;
    const at = (r.servedAt ?? r.session.createdAt).getTime();
    const prev = usage.get(r.templateId);
    usage.set(r.templateId, {
      count: (prev?.count ?? 0) + 1,
      lastServed: Math.max(prev?.lastServed ?? 0, at),
    });
  }
  return usage;
}

/**
 * Templates this candidate has already been shown, for this role, ever.
 *
 * Org-wide rotation stops two applicants sitting the same paper, but it does
 * not stop the *same person* seeing a question twice — with a shallow pool the
 * least-used question can easily be one they answered last month. A returning
 * candidate is the case where a repeat actually hands over the answer, so their
 * own history is an outright exclusion rather than a ranking nudge.
 *
 * Matched on email rather than link, because a second attempt means a second
 * link. Deliberately not time-limited: remembering a question you were asked is
 * not something that expires after sixty days.
 */
async function seenByCandidate(
  candidateEmail: string | null,
  domainId: string,
): Promise<Set<string>> {
  if (!candidateEmail) return new Set();
  const rows = await db.sessionQuestion.findMany({
    where: {
      templateId: { not: null },
      session: { link: { domainId, candidateEmail: candidateEmail.toLowerCase() } },
    },
    select: { templateId: true },
  });
  return new Set(rows.map((r) => r.templateId).filter((id): id is string => id !== null));
}

async function fromBank(
  domainId: string,
  difficulty: Difficulty,
  type: QuestionType,
  count: number,
  seed: string,
  usage: Map<string, Usage>,
  seen: Set<string>,
): Promise<GeneratedQuestion[]> {
  if (count <= 0) return [];
  const rows = await db.questionTemplate.findMany({
    where: { domainId, type, difficulty: { in: NEIGHBOURS[difficulty] } },
  });

  // Ranked, not filtered. Every key is a preference, so a pool too small to
  // satisfy them still returns a full paper — it just starts conceding the
  // weakest preference first. Filtering would hand back a short section.
  //
  //  1. never shown to this candidate      — a repeat here gives them the answer
  //  2. least recently served org-wide     — true LRU, not a raw count, so a
  //                                          question used once last year
  //                                          outranks one used once yesterday
  //  3. fewest times served                — breaks ties between equally old ones
  //  4. exact difficulty over a neighbour
  //  5. per-session shuffle                — the only source of variety once the
  //                                          pool is exhausted, which is why
  //                                          pool depth matters more than this
  const scored = seededShuffle(rows, seed + type).map((r, i) => {
    const u = usage.get(r.id);
    return {
      row: r,
      repeat: seen.has(r.id) ? 1 : 0,
      lastServed: u?.lastServed ?? 0,
      used: u?.count ?? 0,
      exact: r.difficulty === difficulty ? 0 : 1,
      jitter: i,
    };
  });
  scored.sort(
    (a, b) =>
      a.repeat - b.repeat ||
      a.lastServed - b.lastServed ||
      a.used - b.used ||
      a.exact - b.exact ||
      a.jitter - b.jitter,
  );

  return scored.slice(0, count).map((s) => toGenerated(s.row));
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
  /** Lets a returning candidate be given questions they have not already seen. */
  candidateEmail?: string | null;
}): Promise<QuestionSetResult> {
  const provider = getProvider();
  if (blueprintTotal(input.blueprint) === 0) return { questions: [], source: "bank" };

  if (!provider.preferBank) {
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
  const usage = await recentUsage(input.domainId, input.difficulty);
  const seen = await seenByCandidate(input.candidateEmail ?? null, input.domainId);
  const banked: GeneratedQuestion[] = [];
  const missing: Partial<Record<QuestionType, number>> = {};
  for (const type of QUESTION_TYPES) {
    const want = input.blueprint[type] ?? 0;
    const got = await fromBank(input.domainId, input.difficulty, type, want, input.seed, usage, seen);
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
    .sort(
      (a, b) =>
        (seen.has(a.id) ? 1 : 0) - (seen.has(b.id) ? 1 : 0) ||
        (usage.get(a.id)?.lastServed ?? 0) - (usage.get(b.id)?.lastServed ?? 0),
    )
    .slice(0, shortfall)
    .map(toGenerated);
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
