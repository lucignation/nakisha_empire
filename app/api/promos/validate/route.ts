import { NextResponse } from "next/server";
import { z } from "zod";
import { validatePromoCodeForOrder } from "@/lib/server/promos";

const validatePromoSchema = z.object({
  code: z.string().min(3),
  subtotalAmount: z.coerce.number().int().nonnegative()
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = validatePromoSchema.parse(await request.json());
    const { promo, discountAmount } = await validatePromoCodeForOrder({
      code: body.code,
      subtotalAmount: body.subtotalAmount
    });

    return NextResponse.json({
      success: true,
      promo: {
        code: promo.code,
        description: promo.description,
        discountType: promo.discountType,
        amount: promo.amount,
        startsAt: promo.startsAt?.toISOString() ?? null,
        endsAt: promo.endsAt?.toISOString() ?? null
      },
      discountAmount
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Promo validation payload is invalid.", issues: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unexpected promo validation error." },
      { status: 400 }
    );
  }
}
