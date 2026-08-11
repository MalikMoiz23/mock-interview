import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/http";

/** Revokes a link. Existing in-progress sessions keep running; new ones cannot start. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const link = await db.interviewLink.findFirst({ where: { id, orgId: user.orgId } });
    if (!link) return fail(404, "Link not found.");

    await db.interviewLink.update({ where: { id }, data: { status: "REVOKED" } });
    return ok({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
