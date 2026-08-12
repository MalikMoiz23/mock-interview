import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { purgeSnapshots } from "@/lib/snapshots";
import { fail, handleError, ok } from "@/lib/http";

const PatchBody = z.object({ action: z.literal("revoke") });

/**
 * Revoke. The link stops working; everything already recorded is kept.
 * This is the reversible option and the right one for "we no longer want this
 * candidate to be able to start".
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const parsed = PatchBody.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return fail(400, "Unknown action.");

    const link = await db.interviewLink.findFirst({ where: { id, orgId: user.orgId } });
    if (!link) return fail(404, "Link not found.");

    await db.interviewLink.update({ where: { id }, data: { status: "REVOKED" } });
    return ok({ ok: true, status: "REVOKED" });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Delete. Destroys the link, every attempt against it, the answers, the
 * transcripts, the scores, the proctoring events and the stored frames.
 *
 * Irreversible and not the same thing as revoking, so the UI asks for typed
 * confirmation. It exists because a candidate exercising an erasure request,
 * or a recruiter clearing out test runs, needs the data actually gone rather
 * than hidden — the database rows cascade, but the image files on disk do not,
 * so they are removed explicitly first.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const link = await db.interviewLink.findFirst({
      where: { id, orgId: user.orgId },
      include: { sessions: { select: { id: true } } },
    });
    if (!link) return fail(404, "Link not found.");

    // Files first: if the rows go and this fails, the images are orphaned with
    // nothing left pointing at them.
    for (const session of link.sessions) {
      await purgeSnapshots(session.id).catch((err) =>
        console.error(`[delete] Could not purge frames for ${session.id}:`, err),
      );
    }

    // Sessions, questions, events, snapshots and scores all cascade from here.
    await db.interviewLink.delete({ where: { id } });

    return ok({ ok: true, deletedSessions: link.sessions.length });
  } catch (err) {
    return handleError(err);
  }
}
