import { NextResponse } from "next/server";
import { hashIp } from "./crypto";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(status: number, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** Maps thrown errors carrying a `status` property onto HTTP responses. */
export function handleError(err: unknown) {
  const status =
    typeof err === "object" && err !== null && "status" in err
      ? Number((err as { status: unknown }).status)
      : 500;
  const message = err instanceof Error ? err.message : "Unexpected error";
  if (status >= 500) console.error(err);
  return fail(Number.isFinite(status) ? status : 500, status >= 500 ? "Internal error" : message);
}

export function clientIpHash(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return hashIp(ip);
}

// --- In-memory rate limiter -------------------------------------------------
// Single-process only. Behind multiple instances, move this to Redis before
// relying on it as a security control.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
