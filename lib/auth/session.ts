import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE = "fm_session";
const MAX_AGE = 60 * 60 * 24 * 14;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must be configured with at least 32 characters");
  return value;
}
function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}
export async function createSession(userId: string) {
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + MAX_AGE })).toString("base64url");
  const jar = await cookies();
  jar.set(COOKIE, payload + "." + sign(payload), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: MAX_AGE });
}
export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
export async function getCurrentUser() {
  try {
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return null;
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;
    const expected = Buffer.from(sign(payload));
    const received = Buffer.from(signature);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { sub: string; exp: number };
    if (!data.sub || data.exp < Math.floor(Date.now() / 1000)) return null;
    return await db.user.findUnique({ where: { id: data.sub }, include: { staff: true } });
  } catch {
    return null;
  }
}
