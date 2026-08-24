import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DOMAINS, type BankDomain } from "./question-bank";
import { EXTRA_DOMAINS } from "./question-bank-extra";
import { DEPTH_DOMAINS } from "./question-bank-depth";
import { ENTRY_DOMAINS } from "./question-bank-entry";
import { DEPTH_V2_DOMAINS } from "./bank";

/** Merges the two banks so each domain is seeded once with all its questions. */
function mergedDomains(): BankDomain[] {
  const bySlug = new Map<string, BankDomain>();
  for (const d of DOMAINS) bySlug.set(d.slug, { ...d, questions: [...d.questions] });
  for (const extra of [
    ...EXTRA_DOMAINS,
    ...DEPTH_DOMAINS,
    ...ENTRY_DOMAINS,
    ...DEPTH_V2_DOMAINS,
  ]) {
    const existing = bySlug.get(extra.slug);
    if (existing) existing.questions.push(...extra.questions);
    else bySlug.set(extra.slug, { ...extra, questions: [...extra.questions] });
  }
  return [...bySlug.values()];
}

/**
 * Spreads the answer key across the options.
 *
 * Writing a plausible distractor first and the true statement second is a
 * natural authoring habit, and unchecked it put 99% of this bank's answers in
 * position B — enough for a candidate who noticed to score 99% without reading
 * anything. Normalising here means the stored bank is honest whatever reads it;
 * the paper builder shuffles again per session on top of this.
 *
 * Keyed on the prompt so re-seeding is idempotent: the same question always
 * lands in the same place, and a diff of the database stays readable.
 */
function shuffleChoices(
  options: string[] | undefined,
  correctIndex: number | undefined,
  prompt: string,
): { options?: string[]; correctIndex?: number } {
  if (!options || options.length < 2) return { options, correctIndex };
  if (correctIndex === undefined || correctIndex < 0 || correctIndex >= options.length) {
    return { options, correctIndex };
  }

  let h = 2166136261;
  for (let i = 0; i < prompt.length; i++) {
    h ^= prompt.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const order = options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const j = Math.abs(h) % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    options: order.map((i) => options[i]),
    correctIndex: order.indexOf(correctIndex),
  };
}

const db = new PrismaClient();

async function main() {
  const orgName = process.env.SEED_ORG_NAME ?? "Example Software House";
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe!2026";

  const org =
    (await db.organization.findFirst({ where: { name: orgName } })) ??
    (await db.organization.create({ data: { name: orgName } }));

  await db.user.upsert({
    where: { email },
    create: {
      orgId: org.id,
      email,
      name: "Platform Admin",
      passwordHash: await bcrypt.hash(password, 10),
      role: "OWNER",
    },
    update: {},
  });

  const seenPrompts = new Set<string>();
  let duplicates = 0;
  let questionCount = 0;
  const perType: Record<string, number> = {};

  const ALL = mergedDomains();
  for (const d of ALL) {
    const existing = await db.domain.findFirst({ where: { orgId: null, slug: d.slug } });
    const domain =
      existing ??
      (await db.domain.create({
        data: { orgId: null, slug: d.slug, name: d.name, blurb: d.blurb },
      }));

    // Replace the bank for this domain so re-seeding is idempotent.
    await db.questionTemplate.deleteMany({ where: { domainId: domain.id } });
    await db.questionTemplate.createMany({
      data: d.questions.filter((q) => {
        // A prompt repeated across the two banks would waste a bank slot and
        // could surface twice in one paper.
        const key = d.slug + "|" + q.prompt;
        if (seenPrompts.has(key)) { duplicates += 1; return false; }
        seenPrompts.add(key);
        return true;
      }).map((q) => {
        perType[q.type] = (perType[q.type] ?? 0) + 1;
        const shuffled = shuffleChoices(q.options, q.correctIndex, q.prompt);
        return {
          domainId: domain.id,
          difficulty: q.difficulty,
          type: q.type,
          answerMode: q.answerMode,
          prompt: q.prompt,
          timeLimitSec: q.timeLimitSec,
          rubric: { criteria: q.criteria },
          options: shuffled.options ?? undefined,
          correctIndex: shuffled.correctIndex ?? undefined,
          explanation: q.explanation ?? undefined,
        };
      }),
    });
    questionCount += await db.questionTemplate.count({ where: { domainId: domain.id } });
  }

  // A wrong correctIndex silently marks every candidate wrong, so validate it.
  const broken = await db.questionTemplate.findMany({
    where: { type: "MCQ" },
    select: { id: true, prompt: true, options: true, correctIndex: true },
  });
  const invalid = broken.filter((q) => {
    const opts = (q.options as unknown as string[]) ?? [];
    return opts.length < 2 || q.correctIndex === null || q.correctIndex >= opts.length;
  });

  console.log(`Seeded ${ALL.length} domains, ${questionCount} questions.`);
  console.log(
    `  by type: ${Object.entries(perType)
      .map(([t, n]) => `${t} ${n}`)
      .join(" · ")}`,
  );
  if (duplicates > 0) console.warn(`  ! skipped ${duplicates} duplicate prompt(s)`);
  if (invalid.length) {
    console.error(`  ✗ ${invalid.length} MCQ(s) have an invalid correctIndex:`);
    for (const q of invalid) console.error(`    - ${q.prompt.slice(0, 70)}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ all ${broken.length} MCQs have a valid answer key`);
  }

  // A valid answer key is not enough — it also has to be unpredictable. This
  // bank was once 99% position B, which a candidate could have exploited
  // without reading a question. Checked on every seed so it cannot drift back.
  const spread = [0, 0, 0, 0, 0, 0];
  for (const q of broken) if (q.correctIndex !== null) spread[q.correctIndex] += 1;
  const share = spread
    .map((n, i) => ({ letter: String.fromCharCode(65 + i), n, pct: (n / broken.length) * 100 }))
    .filter((s) => s.n > 0);
  console.log(
    `  answer key spread: ${share.map((s) => `${s.letter} ${s.pct.toFixed(0)}%`).join(" · ")}`,
  );
  const worst = Math.max(...share.map((s) => s.pct));
  if (worst > 40) {
    console.error(
      `  ✗ answer keys are clustered — one position holds ${worst.toFixed(0)}% of them. ` +
        `A candidate could guess it. Check the shuffle is running.`,
    );
    process.exitCode = 1;
  }
  console.log(`Admin login: ${email} / ${password}`);
  console.log("Change that password before exposing this to anyone.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
