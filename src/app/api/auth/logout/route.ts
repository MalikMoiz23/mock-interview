import { destroySessionCookie } from "@/lib/auth";
import { handleError, ok } from "@/lib/http";

export async function POST() {
  try {
    await destroySessionCookie();
    return ok({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
