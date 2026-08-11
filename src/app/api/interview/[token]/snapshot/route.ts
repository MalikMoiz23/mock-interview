import { z } from "zod";
import { db } from "@/lib/db";
import { activeSession, resolveLink } from "@/lib/interview";
import { saveSnapshot, snapshotLimit } from "@/lib/snapshots";
import { clientIpHash, fail, handleError, ok, rateLimit } from "@/lib/http";

const Body = z.object({
  sessionId: z.string().min(1),
  /** base64 JPEG data URL of the frame at the moment of the violation. */
  image: z.string().min(64).max(700_000),
  reason: z.string().max(80).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    if (!rateLimit(`snap:${clientIpHash(req)}`, 30, 60_000)) {
      return fail(429, "Too many snapshots.");
    }

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return fail(400, "Malformed snapshot.");

    const link = await resolveLink(token);
    const session = activeSession(link);
    if (!session || session.id !== parsed.data.sessionId) {
      return fail(409, "This interview session is no longer open.");
    }

    const count = await db.snapshot.count({ where: { sessionId: session.id } });
    if (count >= snapshotLimit()) return ok({ stored: false, reason: "limit_reached" });

    const { filename, bytes } = await saveSnapshot(session.id, parsed.data.image);

    // Attach to the most recent unattached event so the admin sees the frame
    // next to the flag that triggered it.
    const recentEvent = await db.proctorEvent.findFirst({
      where: { sessionId: session.id, severity: { gte: 2 }, snapshot: { is: null } },
      orderBy: { at: "desc" },
      select: { id: true },
    });

    const snapshot = await db.snapshot.create({
      data: { sessionId: session.id, filename, bytes, eventId: recentEvent?.id ?? null },
    });

    return ok({ stored: true, id: snapshot.id });
  } catch (err) {
    return handleError(err);
  }
}
