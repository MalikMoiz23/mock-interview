import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DOMAINS } from "./question-bank";

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

  let questionCount = 0;
  const perType: Record<string, number> = {};

  for (const d of DOMAINS) {
    const existing = await db.domain.findFirst({ where: { orgId: null, slug: d.slug } });
    const domain =
      existing ??
      (await db.domain.create({
        data: { orgId: null, slug: d.slug, name: d.name, blurb: d.blurb },
      }));

    // Replace the bank for this domain so re-seeding is idempotent.
    await db.questionTemplate.deleteMany({ where: { domainId: domain.id } });
    await db.questionTemplate.createMany({
      data: d.questions.map((q) => {
        perType[q.type] = (perType[q.type] ?? 0) + 1;
        return {
          domainId: domain.id,
          difficulty: q.difficulty,
          type: q.type,
          answerMode: q.answerMode,
          prompt: q.prompt,
          timeLimitSec: q.timeLimitSec,
          rubric: { criteria: q.criteria },
          options: q.options ?? undefined,
          correctIndex: q.correctIndex ?? undefined,
          explanation: q.explanation ?? undefined,
        };
      }),
    });
    questionCount += d.questions.length;
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

  console.log(`Seeded ${DOMAINS.length} domains, ${questionCount} questions.`);
  console.log(
    `  by type: ${Object.entries(perType)
      .map(([t, n]) => `${t} ${n}`)
      .join(" · ")}`,
  );
  if (invalid.length) {
    console.error(`  ✗ ${invalid.length} MCQ(s) have an invalid correctIndex:`);
    for (const q of invalid) console.error(`    - ${q.prompt.slice(0, 70)}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ all ${broken.length} MCQs have a valid answer key`);
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
