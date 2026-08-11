import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSessionCookie } from "@/lib/auth";
import { clientIpHash, fail, handleError, ok, rateLimit } from "@/lib/http";

const Body = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

export async function POST(req: Request) {
  try {
    const ip = clientIpHash(req);
    if (!rateLimit(`login:${ip}`, 10, 15 * 60_000)) {
      return fail(429, "Too many attempts. Wait 15 minutes.");
    }

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return fail(400, "Email and password are required.");

    const user = await db.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });

    // Compare against a dummy hash when the user is missing so response time
    // does not reveal whether the address exists.
    const hash = user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
    const valid = await bcrypt.compare(parsed.data.password, hash);

    if (!user || !valid) return fail(401, "Incorrect email or password.");

    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await createSessionCookie(user.id);
    return ok({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
