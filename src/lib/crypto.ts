import crypto from "node:crypto";
import { env } from "./env";

/** Opaque candidate token. 32 bytes of CSPRNG entropy, URL-safe. */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/** Tokens are stored hashed so a database leak does not hand out live links. */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** IPs are never stored raw; this is a keyed, non-reversible fingerprint. */
export function hashIp(ip: string): string {
  return crypto
    .createHmac("sha256", env.authSecret)
    .update(ip)
    .digest("hex")
    .slice(0, 32);
}

export function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
