import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { gradeSession } from "@/lib/grading";
import { fail, handleError, ok } from "@/lib/http";

export const maxDuration = 300;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const session = await db.interviewSession.findFirst({
      where: { id, link: { orgId: user.orgId } },
      select: { id: true, status: true },
    });
    if (!session) return fail(404, "Session not found.");
    if (session.status === "PENDING" || session.status === "IN_PROGRESS") {
      return fail(409, "Interview is still in progress.");
    }

    await gradeSession(id);
    return ok({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
