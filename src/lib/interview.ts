import { db } from "./db";
import { hashToken } from "./crypto";
import { QUESTION_TYPE_META } from "./blueprint";
import { SECTION_INSTRUCTIONS } from "./sections";
import type { AnswerMode, QuestionType } from "@prisma/client";

export type ResolvedLink = Awaited<ReturnType<typeof resolveLink>>;

/**
 * Looks up a candidate link by raw token and validates it is usable.
 * Throws a status-carrying error the route handler maps to HTTP.
 */
export async function resolveLink(rawToken: string) {
  if (!rawToken || rawToken.length < 20 || rawToken.length > 128) {
    throw Object.assign(new Error("Invalid interview link"), { status: 404 });
  }
  const link = await db.interviewLink.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: {
      domain: true,
      sessions: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!link) throw Object.assign(new Error("Invalid interview link"), { status: 404 });

  if (link.status === "REVOKED") {
    throw Object.assign(new Error("This interview link has been revoked."), { status: 403 });
  }
  if (link.expiresAt.getTime() < Date.now()) {
    if (link.status === "ACTIVE") {
      await db.interviewLink.update({ where: { id: link.id }, data: { status: "EXPIRED" } });
    }
    throw Object.assign(new Error("This interview link has expired."), { status: 410 });
  }

  return link;
}

/** The session currently in progress for a link, if any. */
export function activeSession(link: ResolvedLink) {
  return link.sessions.find(
    (s) => s.status === "PENDING" || s.status === "IN_PROGRESS",
  );
}

export function attemptsUsed(link: ResolvedLink): number {
  return link.sessions.filter(
    (s) => s.status !== "PENDING" || s.startedAt !== null,
  ).length;
}

/** True when the server-side deadline has passed. Client clocks are ignored. */
export function isExpired(session: { deadlineAt: Date | null }): boolean {
  return session.deadlineAt !== null && session.deadlineAt.getTime() < Date.now();
}

export type ServedQuestion = {
  id: string;
  /** Position within the section, 0-based. */
  indexInSection: number;
  type: QuestionType;
  answerMode: AnswerMode;
  prompt: string;
  /** MCQ only. The correct index is deliberately absent from this payload. */
  options: string[];
  timeLimitSec: number;
  /** Draft answer already saved, so a reload restores the candidate's work. */
  answerText: string;
  selectedIndex: number | null;
  skipped: boolean;
};

export type ServedSection = {
  index: number;
  total: number;
  type: QuestionType;
  title: string;
  instructions: string;
  questions: ServedQuestion[];
  /** Sum of the section's per-question time allowances, for guidance only. */
  suggestedSec: number;
  /** Server-issued. */
  servedAt: string;
};

/**
 * Returns the section the candidate is currently on, stamping `servedAt` on
 * its questions the first time they are handed out.
 *
 * Only one section crosses the wire at a time. The candidate can move around
 * inside it, but the rest of the paper — and every answer key — stays on the
 * server.
 */
export async function serveCurrentSection(
  sessionId: string,
): Promise<ServedSection | null> {
  const session = await db.interviewSession.findUnique({
    where: { id: sessionId },
    select: { currentSection: true },
  });
  if (!session) return null;

  const all = await db.sessionQuestion.findMany({
    where: { sessionId },
    orderBy: { order: "asc" },
  });
  if (all.length === 0) return null;

  const totalSections = new Set(all.map((q) => q.sectionIndex)).size;
  if (session.currentSection >= totalSections) return null;

  const questions = all.filter((q) => q.sectionIndex === session.currentSection);
  if (questions.length === 0) return null;

  const now = new Date();
  const unstamped = questions.filter((q) => q.servedAt === null).map((q) => q.id);
  if (unstamped.length > 0) {
    await db.sessionQuestion.updateMany({
      where: { id: { in: unstamped } },
      data: { servedAt: now },
    });
  }

  const first = questions[0];
  const meta = QUESTION_TYPE_META[first.type];

  return {
    index: session.currentSection,
    total: totalSections,
    type: first.type,
    title: meta.label,
    instructions: SECTION_INSTRUCTIONS[first.type],
    suggestedSec: questions.reduce((s, q) => s + q.timeLimitSec, 0),
    servedAt: (first.servedAt ?? now).toISOString(),
    questions: questions.map((q, i) => ({
      id: q.id,
      indexInSection: i,
      type: q.type,
      answerMode: q.answerMode,
      prompt: q.prompt,
      // Only the option text crosses the wire. `correctIndex` stays server-side
      // so the answer key is never in the candidate's browser.
      options: (q.options as unknown as string[]) ?? [],
      timeLimitSec: q.timeLimitSec,
      answerText: q.answerText,
      selectedIndex: q.selectedIndex,
      skipped: q.skipped,
    })),
  };
}

/** Progress counters for the candidate's header. */
export async function sessionProgress(sessionId: string) {
  const all = await db.sessionQuestion.findMany({
    where: { sessionId },
    select: { sectionIndex: true, submittedAt: true },
  });
  return {
    totalQuestions: all.length,
    answeredQuestions: all.filter((q) => q.submittedAt !== null).length,
    totalSections: new Set(all.map((q) => q.sectionIndex)).size,
  };
}
