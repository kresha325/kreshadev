import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const cookieName = "kreshadev_admin";
const sessionDurationSeconds = 60 * 60 * 8;
const failures = new Map<string, { count: number; resetAt: number }>();

export function isAdminConfigured() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  return Boolean(password && secret && secret.length >= 32);
}

function cookieValue(request: Request) {
  const header = request.headers.cookie ?? "";
  const pair = header.split(";").map((value) => value.trim()).find((value) => value.startsWith(`${cookieName}=`));
  return pair?.slice(cookieName.length + 1) ?? "";
}

function sign(payload: string) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "").update(payload).digest("base64url");
}

export function hasAdminSession(request: Request) {
  if (!isAdminConfigured()) return false;
  const [payload, signature, extra] = cookieValue(request).split(".");
  if (!payload || !signature || extra) return false;
  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  const [expiresAt, nonce] = Buffer.from(payload, "base64url").toString("utf8").split(":");
  return Boolean(nonce && Number(expiresAt) > Date.now());
}

export function checkSameOrigin(request: Request) {
  const origin = request.get("origin");
  if (!origin) return true;
  try {
    const parsedOrigin = new URL(origin);
    if (parsedOrigin.host === request.get("host")) return true;
    if (process.env.NODE_ENV === "development" && process.env.PORTFOLIO_ORIGIN) {
      return parsedOrigin.origin === new URL(process.env.PORTFOLIO_ORIGIN).origin;
    }
    return false;
  } catch {
    return false;
  }
}

export function authenticateAdmin(request: Request, response: Response, next: NextFunction) {
  if (!isAdminConfigured()) {
    response.status(503).json({ error: "Admin login is not configured on the server." });
    return;
  }
  if (!hasAdminSession(request)) {
    response.status(401).json({ error: "Please sign in to manage projects." });
    return;
  }
  next();
}

export function loginAdmin(request: Request, password: string) {
  const ip = request.ip;
  const now = Date.now();
  const current = failures.get(ip);
  if (current && current.resetAt > now && current.count >= 5) return false;
  if (current && current.resetAt <= now) failures.delete(ip);

  const supplied = createHash("sha256").update(password).digest();
  const expected = createHash("sha256").update(process.env.ADMIN_PASSWORD ?? "").digest();
  const valid = timingSafeEqual(supplied, expected);
  if (!valid) {
    const latest = failures.get(ip);
    failures.set(ip, {
      count: (latest && latest.resetAt > now ? latest.count : 0) + 1,
      resetAt: latest && latest.resetAt > now ? latest.resetAt : now + 15 * 60 * 1000,
    });
    return false;
  }
  failures.delete(ip);
  return true;
}

export function createAdminCookie() {
  const expiresAt = Date.now() + sessionDurationSeconds * 1000;
  const payload = Buffer.from(`${expiresAt}:${randomBytes(16).toString("hex")}`).toString("base64url");
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${cookieName}=${payload}.${sign(payload)}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${sessionDurationSeconds}${secure}`;
}

export function clearAdminCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${cookieName}=; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}
