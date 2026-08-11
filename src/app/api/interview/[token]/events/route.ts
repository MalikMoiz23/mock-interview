import { z } from "zod";
import { db } from "@/lib/db";
import { activeSession, resolveLink } from "@/lib/interview";
import { EVENT_RULES } from "@/lib/integrity";
import { clientIpHash, fail, handleError, ok, rateLimit } from "@/lib/http";
import type { EventType } from "@prisma/client";

const EVENT_TYPES = Object.keys(EVENT_RULES) as [EventType, ...EventType[]];

const Body = z.object({
  sessionId: z.string().min(1),
  events: z
    .array(
      z.object({
        type: z.enum(EVENT_TYPES),
        durationMs: z.number().int().nonnegative().max(3_600_000).default(0),
        /** Client wall-clock, kept for correlation only. Never trusted for timing. */
        clientAt: z.number().int().nonnegative().optional(),
        meta: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .min(1)
    .max(50),
});

/** Per-session cap so a hostile client cannot fill the database. */
const MAX_EVENTS_PER_SESSION = 2_000;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    if (!rateLimit(`events:${clientIpHash(req)}`, 120, 60_000)) {
      return fail(429, "Too many requests.");
    }

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return fail(400, "Malformed event batch.");

    const link = await resolveLink(token);
    const session = activeSession(link);
    if (!session || session.id !== parsed.data.sessionId) {
      return fail(409, "This interview session is no longer open.");
    }

    const existing = await db.proctorEvent.count({ where: { sessionId: session.id } });
    if (existing >= MAX_EVENTS_PER_SESSION) {
      return ok({ accepted: 0, capped: true });
    }

    const room = MAX_EVENTS_PER_SESSION - existing;
    const batch = parsed.data.events.slice(0, room);

    await db.proctorEvent.createMany({
      data: batch.map((e) => ({
        sessionId: session.id,
        type: e.type,
        severity: EVENT_RULES[e.type].severity,
        durationMs: e.durationMs,
        meta: (e.meta ?? undefined) as unknown as object | undefined,
      })),
    });

    return ok({ accepted: batch.length });
  } catch (err) {
    return handleError(err);
  }
}
