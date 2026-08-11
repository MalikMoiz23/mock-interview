import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { readSnapshot } from "@/lib/snapshots";
import { fail, handleError } from "@/lib/http";

/** Serves a violation snapshot. Org-scoped: never public, never guessable. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const snapshot = await db.snapshot.findFirst({
      where: { id, session: { link: { orgId: user.orgId } } },
      select: { sessionId: true, filename: true },
    });
    if (!snapshot) return fail(404, "Snapshot not found.");

    const buffer = await readSnapshot(snapshot.sessionId, snapshot.filename);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": `inline; filename="${snapshot.filename}"`,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
