import crypto from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";
import { env } from "./env";
import { timingSafeEqual } from "./crypto";

const COOKIE = "ai_interview_admin";
const MAX_AGE_SEC = 60 * 60 * 8; // 8 hours

type SessionPayload = { uid: string; exp: number };

function sign(value: string): string {
  return crypto.createHmac("sha256", env.authSecret).update(value).digest("base64url");
}

function serialize(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function deserialize(raw: string): SessionPayload | null {
  const [body, mac] = raw.split(".");
  if (!body || !mac) return null;
  if (!timingSafeEqual(mac, sign(body))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (typeof payload.uid !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSessionCookie(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, serialize({ uid: userId, exp: Date.now() + MAX_AGE_SEC * 1000 }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function destroySessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export type AdminUser = {
  id: string;
  orgId: string;
  email: string;
  name: string;
  role: "OWNER" | "RECRUITER";
};

/** Returns the signed-in admin, or null. Never throws. */
export async function getCurrentUser(): Promise<AdminUser | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const payload = deserialize(raw);
  if (!payload) return null;

  const user = await db.user.findUnique({
    where: { id: payload.uid },
    select: { id: true, orgId: true, email: true, name: true, role: true },
  });
  return user;
}

/** Use inside API route handlers. Throws a 401-shaped error when signed out. */
export async function requireUser(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw Object.assign(new Error("Not authenticated"), { status: 401 });
  }
  return user;
}
