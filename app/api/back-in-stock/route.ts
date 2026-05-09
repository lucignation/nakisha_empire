import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeToBackInStock } from "@/lib/server/back-in-stock";

const backInStockSchema = z.object({
  productId: z.string().min(2),
  email: z.string().email()
});

export async function POST(request: Request) {
  try {
    const body = backInStockSchema.parse(await request.json());

    await subscribeToBackInStock({
      productId: body.productId,
      email: body.email
    });

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid email address is required.",
          issues: error.flatten()
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected back-in-stock subscription error."
      },
      { status: 500 }
    );
  }
}
