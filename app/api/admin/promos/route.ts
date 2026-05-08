import { PromoDiscountType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromCookies } from "@/lib/server/admin-auth";
import { normalizePromoCode } from "@/lib/server/promos";

const optionalDateField = z.preprocess(
  (value) => (value === "" || value === null || typeof value === "undefined" ? undefined : value),
  z.coerce.date().optional()
);

const createPromoSchema = z
  .object({
    code: z.string().min(3),
    description: z.string().optional().nullable(),
    discountType: z.nativeEnum(PromoDiscountType),
    amount: z.coerce.number().int().positive(),
    minOrderAmount: z.preprocess(
      (value) => (value === "" || value === null || typeof value === "undefined" ? undefined : value),
      z.coerce.number().int().nonnegative().optional()
    ),
    startsAt: optionalDateField.nullish(),
    endsAt: optionalDateField.nullish(),
    usageLimit: z.preprocess(
      (value) => (value === "" || value === null || typeof value === "undefined" ? undefined : value),
      z.coerce.number().int().positive().optional()
    ),
    isActive: z.boolean().default(true)
  })
  .superRefine((input, ctx) => {
    if ((input.startsAt && !input.endsAt) || (!input.startsAt && input.endsAt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "Provide both start and end dates for the promo window."
      });
    }

    if (input.startsAt && input.endsAt && input.endsAt <= input.startsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "Promo end must be later than promo start."
      });
    }

    if (input.discountType === "PERCENTAGE" && input.amount > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Percentage discounts cannot be greater than 100."
      });
    }
  });

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!getAdminSessionFromCookies()) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { success: false, message: "DATABASE_URL is missing. Connect Neon before creating promo codes." },
        { status: 500 }
      );
    }

    const body = createPromoSchema.parse(await request.json());

    const promo = await prisma.promoCode.create({
      data: {
        code: normalizePromoCode(body.code),
        description: body.description?.trim() || null,
        discountType: body.discountType,
        amount: body.amount,
        minOrderAmount: body.minOrderAmount ?? null,
        startsAt: body.startsAt ?? null,
        endsAt: body.endsAt ?? null,
        usageLimit: body.usageLimit ?? null,
        isActive: body.isActive
      }
    });

    return NextResponse.json({
      success: true,
      promoId: promo.id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Promo code form is invalid.", issues: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unexpected promo code creation error." },
      { status: 500 }
    );
  }
}
