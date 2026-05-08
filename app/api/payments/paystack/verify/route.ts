import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPaystackTransaction } from "@/lib/server/payment-verification";

const verifyPaystackSchema = z.object({
  reference: z.string().min(3),
  expectedAmount: z.number().int().positive().optional(),
  currency: z.string().min(3).default("NGN")
});

export async function POST(request: Request) {
  try {
    const body = verifyPaystackSchema.parse(await request.json());
    const transaction = await verifyPaystackTransaction({
      reference: body.reference,
      expectedAmount: body.expectedAmount,
      currency: body.currency
    });

    return NextResponse.json({
      verified: true,
      message: "Paystack payment verified successfully.",
      transaction: {
        reference: transaction.reference,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          verified: false,
          message: "Invalid Paystack verification payload.",
          issues: error.flatten()
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        verified: false,
        message: error instanceof Error ? error.message : "Unexpected Paystack verification error."
      },
      { status: 500 }
    );
  }
}
