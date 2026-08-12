/**
 * Removes interview links created by automated test runs.
 *
 * Test fixtures are addressed at @e.com and @example.com — reserved example
 * domains that no real candidate can receive mail at, which makes them a safe
 * discriminator. Anything at a real domain is left alone.
 *
 * Dry run by default; pass --confirm to actually delete:
 *   npm run db:clean-tests
 *   npm run db:clean-tests -- --confirm
 */
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "node:fs";
import path from "node:path";

const db = new PrismaClient();
const SNAPSHOT_ROOT = path.resolve(process.env.SNAPSHOT_DIR ?? "./data/snapshots");
const TEST_DOMAINS = ["@e.com", "@example.com"];
const confirmed = process.argv.includes("--confirm");

const where = { OR: TEST_DOMAINS.map((d) => ({ candidateEmail: { endsWith: d } })) };

const links = await db.interviewLink.findMany({
  where,
  orderBy: { createdAt: "asc" },
  select: {
    id: true,
    candidateName: true,
    candidateEmail: true,
    sessions: { select: { id: true } },
  },
});

const keep = await db.interviewLink.findMany({
  where: { NOT: where },
  orderBy: { createdAt: "asc" },
  select: { candidateName: true, candidateEmail: true },
});

const sessionIds = links.flatMap((l) => l.sessions.map((s) => s.id));

console.log(`Test links to delete: ${links.length} (${sessionIds.length} session(s))`);
for (const l of links) console.log(`  - ${l.candidateName} <${l.candidateEmail}>`);

console.log(`\nLinks that will be KEPT: ${keep.length}`);
for (const k of keep) console.log(`  ✓ ${k.candidateName} <${k.candidateEmail}>`);

if (!confirmed) {
  console.log("\nDry run. Nothing was deleted. Re-run with --confirm to apply.");
  await db.$disconnect();
  process.exit(0);
}

// Files first: once the rows are gone nothing points at the images any more.
let dirsRemoved = 0;
for (const id of sessionIds) {
  const dir = path.resolve(SNAPSHOT_ROOT, id);
  if (!dir.startsWith(SNAPSHOT_ROOT + path.sep)) continue;
  try {
    await fs.access(dir);
    await fs.rm(dir, { recursive: true, force: true });
    dirsRemoved += 1;
  } catch {
    // No frames were stored for this session.
  }
}

// Sessions, answers, events, snapshots and scores cascade from the link.
const { count } = await db.interviewLink.deleteMany({
  where: { id: { in: links.map((l) => l.id) } },
});

// Sweep orphaned frames: any snapshot directory with no matching session row is
// unreachable by the app and will never be served again. These accumulate from
// earlier resets and interrupted runs, so collect them regardless of origin.
let orphansRemoved = 0;
try {
  const live = new Set(
    (await db.interviewSession.findMany({ select: { id: true } })).map((s) => s.id),
  );
  const dirs = await fs.readdir(SNAPSHOT_ROOT, { withFileTypes: true });
  for (const d of dirs) {
    if (!d.isDirectory() || live.has(d.name)) continue;
    const dir = path.resolve(SNAPSHOT_ROOT, d.name);
    if (!dir.startsWith(SNAPSHOT_ROOT + path.sep)) continue;
    await fs.rm(dir, { recursive: true, force: true });
    orphansRemoved += 1;
  }
} catch {
  // No snapshot root on disk yet.
}

console.log(`\nDeleted ${count} link(s); removed ${dirsRemoved} snapshot director(ies).`);
console.log(`Swept ${orphansRemoved} orphaned snapshot director(ies).`);
console.log("Remaining:", {
  links: await db.interviewLink.count(),
  sessions: await db.interviewSession.count(),
  answers: await db.sessionQuestion.count(),
  events: await db.proctorEvent.count(),
  snapshots: await db.snapshot.count(),
  adminUsers: await db.user.count(),
  questionBank: await db.questionTemplate.count(),
});

await db.$disconnect();
