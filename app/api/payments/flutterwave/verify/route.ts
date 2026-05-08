import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFlutterwaveTransaction } from "@/lib/server/payment-verification";

const verifyFlutterwaveSchema = z.object({
  transactionId: z.coerce.number().int().positive(),
  txRef: z.string().min(3),
  expectedAmount: z.number().positive().optional(),
  currency: z.string().min(3).default("NGN")
});

export async function POST(request: Request) {
  try {
    const body = verifyFlutterwaveSchema.parse(await request.json());
    const transaction = await verifyFlutterwaveTransaction({
      transactionId: body.transactionId,
      txRef: body.txRef,
      expectedAmount: body.expectedAmount,
      currency: body.currency
    });

    return NextResponse.json({
      verified: true,
      message: "Flutterwave payment verified successfully.",
      transaction: {
        id: transaction.id,
        txRef: transaction.txRef,
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
          message: "Invalid Flutterwave verification payload.",
          issues: error.flatten()
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        verified: false,
        message: error instanceof Error ? error.message : "Unexpected Flutterwave verification error."
      },
      { status: 500 }
    );
  }
}
