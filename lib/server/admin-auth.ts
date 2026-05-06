import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "nakisha-empire-admin-session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

export interface AdminSession {
  email: string;
  role: "SUPER_ADMIN";
  expiresAt: number;
}

function getAdminSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.NEXTAUTH_SECRET ?? "nakisha-empire-dev-secret";
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function signPayload(value: string) {
  return createHmac("sha256", getAdminSecret()).update(value).digest("base64url");
}

export function getConfiguredSuperAdminEmail() {
  return process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() ?? "";
}

export function isSuperAdminConfigured() {
  return Boolean(getConfiguredSuperAdminEmail() && process.env.SUPER_ADMIN_PASSWORD);
}

export function validateSuperAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const configuredEmail = getConfiguredSuperAdminEmail();
  const configuredPassword = process.env.SUPER_ADMIN_PASSWORD ?? "";

  if (!configuredEmail || !configuredPassword) {
    return false;
  }

  return normalizedEmail === configuredEmail && password === configuredPassword;
}

export function createAdminSessionToken(email: string) {
  const payload: AdminSession = {
    email: email.trim().toLowerCase(),
    role: "SUPER_ADMIN",
    expiresAt: Date.now() + SESSION_DURATION_MS
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(token?: string | null): AdminSession | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);

  try {
    const received = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);

    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as AdminSession;

    if (payload.role !== "SUPER_ADMIN" || payload.expiresAt <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getAdminSessionFromCookies() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export function requireAdminSession() {
  const session = getAdminSessionFromCookies();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}
