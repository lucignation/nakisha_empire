import { unstable_noStore as noStore } from "next/cache";
import { PromoDiscountType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface AdminPromoCodeRecord {
  id: string;
  code: string;
  description?: string | null;
  discountType: PromoDiscountType;
  amount: number;
  minOrderAmount?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
  usageLimit?: number | null;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

function mapPromoRecord(promo: {
  id: string;
  code: string;
  description?: string | null;
  discountType: PromoDiscountType;
  amount: number;
  minOrderAmount?: number | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  isActive: boolean;
  usageLimit?: number | null;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}): AdminPromoCodeRecord {
  return {
    id: promo.id,
    code: promo.code,
    description: promo.description,
    discountType: promo.discountType,
    amount: promo.amount,
    minOrderAmount: promo.minOrderAmount,
    startsAt: promo.startsAt?.toISOString() ?? null,
    endsAt: promo.endsAt?.toISOString() ?? null,
    isActive: promo.isActive,
    usageLimit: promo.usageLimit,
    usageCount: promo.usageCount,
    createdAt: promo.createdAt.toISOString(),
    updatedAt: promo.updatedAt.toISOString()
  };
}

export function normalizePromoCode(code: string) {
  return code.trim().toUpperCase();
}

function databaseIsConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function isPromoCurrentlyValid(input: {
  isActive: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
  usageLimit?: number | null;
  usageCount: number;
  now?: Date;
}) {
  const now = input.now ?? new Date();

  if (!input.isActive) {
    return false;
  }

  if (input.startsAt && now < input.startsAt) {
    return false;
  }

  if (input.endsAt && now > input.endsAt) {
    return false;
  }

  if (typeof input.usageLimit === "number" && input.usageCount >= input.usageLimit) {
    return false;
  }

  return true;
}

export function calculatePromoDiscount(input: {
  discountType: PromoDiscountType;
  amount: number;
  subtotalAmount: number;
}) {
  if (input.subtotalAmount <= 0 || input.amount <= 0) {
    return 0;
  }

  if (input.discountType === "PERCENTAGE") {
    return Math.min(input.subtotalAmount, Math.floor((input.subtotalAmount * input.amount) / 100));
  }

  return Math.min(input.subtotalAmount, input.amount);
}

export async function getAdminPromoCodes(limit?: number): Promise<AdminPromoCodeRecord[]> {
  noStore();

  if (!databaseIsConfigured()) {
    return [];
  }

  try {
    const records = await prisma.promoCode.findMany({
      orderBy: [{ createdAt: "desc" }],
      ...(typeof limit === "number" ? { take: limit } : {})
    });

    return records.map(mapPromoRecord);
  } catch (error) {
    console.error("Unable to load promo codes from Prisma/Neon", error);
    return [];
  }
}

export async function getAdminPromoCodeById(id: string): Promise<AdminPromoCodeRecord | null> {
  noStore();

  if (!databaseIsConfigured()) {
    return null;
  }

  try {
    const promo = await prisma.promoCode.findUnique({
      where: { id }
    });

    return promo ? mapPromoRecord(promo) : null;
  } catch (error) {
    console.error(`Unable to load promo code ${id} from Prisma/Neon`, error);
    return null;
  }
}

export async function validatePromoCodeForOrder(input: {
  code: string;
  subtotalAmount: number;
  now?: Date;
}) {
  if (!databaseIsConfigured()) {
    throw new Error("DATABASE_URL is missing. Promo code validation is unavailable.");
  }

  const normalizedCode = normalizePromoCode(input.code);
  const promo = await prisma.promoCode.findUnique({
    where: {
      code: normalizedCode
    }
  });

  if (!promo) {
    throw new Error("Promo code was not found.");
  }

  if (!isPromoCurrentlyValid({ ...promo, now: input.now })) {
    throw new Error("This promo code is not active right now.");
  }

  if (typeof promo.minOrderAmount === "number" && input.subtotalAmount < promo.minOrderAmount) {
    throw new Error(`This promo requires a minimum subtotal of ₦${promo.minOrderAmount.toLocaleString()}.`);
  }

  const discountAmount = calculatePromoDiscount({
    discountType: promo.discountType,
    amount: promo.amount,
    subtotalAmount: input.subtotalAmount
  });

  if (discountAmount <= 0) {
    throw new Error("This promo code does not produce a usable discount on the current basket.");
  }

  return {
    promo,
    discountAmount
  };
}
