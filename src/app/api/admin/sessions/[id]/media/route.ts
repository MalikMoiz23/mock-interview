import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { purgeSnapshots } from "@/lib/snapshots";
import { fail, handleError, ok } from "@/lib/http";

/**
 * Deletes every stored frame for a session. Exposed so you can honour a
 * candidate erasure request without touching the filesystem by hand.
 * Scores, transcripts and event counts survive; only the imagery is destroyed.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const session = await db.interviewSession.findFirst({
      where: { id, link: { orgId: user.orgId } },
      select: { id: true },
    });
    if (!session) return fail(404, "Session not found.");

    await purgeSnapshots(id);
    const { count } = await db.snapshot.deleteMany({ where: { sessionId: id } });
    return ok({ deleted: count });
  } catch (err) {
    return handleError(err);
  }
}
