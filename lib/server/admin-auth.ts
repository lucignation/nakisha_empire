import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function signPayload(value: string) {
  return createHmac("sha256", getAdminSecret()).update(value).digest("base64url");
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

function verifyHashedPassword(password: string, storedHash: string) {
  const [salt, expectedHash] = storedHash.split(":");

  if (!salt || !expectedHash) {
    return false;
  }

  const actualHash = scryptSync(password, salt, 64).toString("hex");
  const actualBuffer = Buffer.from(actualHash, "hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");

  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

async function findDatabaseAdmin(email: string) {
  try {
    return await prisma.adminUser.findUnique({
      where: { email: normalizeEmail(email) }
    });
  } catch {
    return null;
  }
}

async function ensureDatabaseSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim();
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!process.env.DATABASE_URL || !email || !password) {
    return null;
  }

  try {
    const normalizedEmail = normalizeEmail(email);
    const existing = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      return existing;
    }

    return await prisma.adminUser.create({
      data: {
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        role: "SUPER_ADMIN"
      }
    });
  } catch {
    return null;
  }
}

export function getConfiguredSuperAdminEmail() {
  return normalizeEmail(process.env.SUPER_ADMIN_EMAIL ?? "");
}

export function isSuperAdminConfigured() {
  return Boolean(getConfiguredSuperAdminEmail() && process.env.SUPER_ADMIN_PASSWORD) || Boolean(process.env.DATABASE_URL);
}

export async function validateSuperAdminCredentials(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const configuredEmail = getConfiguredSuperAdminEmail();
  const configuredPassword = process.env.SUPER_ADMIN_PASSWORD ?? "";

  const seededAdmin = await ensureDatabaseSuperAdmin();
  const databaseAdmin = seededAdmin?.email === normalizedEmail ? seededAdmin : await findDatabaseAdmin(normalizedEmail);

  if (databaseAdmin) {
    return verifyHashedPassword(password, databaseAdmin.passwordHash);
  }

  if (!configuredEmail || !configuredPassword) {
    return false;
  }

  return normalizedEmail === configuredEmail && password === configuredPassword;
}

export async function markAdminLogin(email: string) {
  try {
    await prisma.adminUser.update({
      where: { email: normalizeEmail(email) },
      data: {
        lastLoginAt: new Date()
      }
    });
  } catch {
    return;
  }
}

export async function changeSuperAdminPassword(input: {
  email: string;
  currentPassword: string;
  nextPassword: string;
}) {
  const normalizedEmail = normalizeEmail(input.email);

  if (!(await validateSuperAdminCredentials(normalizedEmail, input.currentPassword))) {
    throw new Error("Current password is incorrect.");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to store password changes securely.");
  }

  try {
    return await prisma.adminUser.upsert({
      where: { email: normalizedEmail },
      create: {
        email: normalizedEmail,
        passwordHash: hashPassword(input.nextPassword),
        role: "SUPER_ADMIN",
        lastLoginAt: new Date()
      },
      update: {
        passwordHash: hashPassword(input.nextPassword),
        lastLoginAt: new Date()
      }
    });
  } catch {
    throw new Error("Admin password storage is not ready yet. Run the latest Prisma schema on the database first.");
  }
}

export function createAdminSessionToken(email: string) {
  const payload: AdminSession = {
    email: normalizeEmail(email),
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
