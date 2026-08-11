import { db } from "./db";
import { hashToken } from "./crypto";
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
  order: number;
  total: number;
  type: QuestionType;
  answerMode: AnswerMode;
  prompt: string;
  /** MCQ only. The correct index is deliberately absent from this payload. */
  options: string[];
  timeLimitSec: number;
  /** Server-issued. The client counts down from this, the server enforces it. */
  servedAt: string;
};

/**
 * Returns the next unanswered question, stamping `servedAt` the first time it
 * is handed out. Questions are served one at a time so the candidate can never
 * read ahead — the full paper is never in the browser.
 */
export async function serveCurrentQuestion(
  sessionId: string,
): Promise<ServedQuestion | null> {
  const questions = await db.sessionQuestion.findMany({
    where: { sessionId },
    orderBy: { order: "asc" },
  });
  const next = questions.find((q) => q.submittedAt === null);
  if (!next) return null;

  const servedAt =
    next.servedAt ??
    (
      await db.sessionQuestion.update({
        where: { id: next.id },
        data: { servedAt: new Date() },
        select: { servedAt: true },
      })
    ).servedAt!;

  return {
    id: next.id,
    order: next.order,
    total: questions.length,
    type: next.type,
    answerMode: next.answerMode,
    prompt: next.prompt,
    // Only the option text crosses the wire. `correctIndex` stays server-side
    // so the answer key is never in the candidate's browser.
    options: (next.options as unknown as string[]) ?? [],
    timeLimitSec: next.timeLimitSec,
    servedAt: servedAt.toISOString(),
  };
}
