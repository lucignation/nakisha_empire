import { NextResponse } from "next/server";
import { z } from "zod";

const verifyFlutterwaveSchema = z.object({
  transactionId: z.coerce.number().int().positive(),
  txRef: z.string().min(3),
  expectedAmount: z.number().positive().optional(),
  currency: z.string().min(3).default("NGN")
});

export async function POST(request: Request) {
  try {
    if (!process.env.FLUTTERWAVE_SECRET_KEY) {
      return NextResponse.json(
        {
          verified: false,
          message: "FLUTTERWAVE_SECRET_KEY is missing."
        },
        { status: 500 }
      );
    }

    const body = verifyFlutterwaveSchema.parse(await request.json());

    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${body.transactionId}/verify`, {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      cache: "no-store"
    });

    const payload = (await response.json()) as {
      status?: string;
      message?: string;
      data?: {
        status?: string;
        tx_ref?: string;
        amount?: number;
        currency?: string;
        id?: number;
      };
    };

    if (!response.ok || payload.status !== "success" || !payload.data) {
      return NextResponse.json(
        {
          verified: false,
          message: payload.message ?? "Unable to verify Flutterwave payment."
        },
        { status: response.status || 500 }
      );
    }

    const transaction = payload.data;
    const statusMatches = transaction.status === "successful";
    const referenceMatches = transaction.tx_ref === body.txRef;
    const amountMatches = body.expectedAmount ? Number(transaction.amount) === body.expectedAmount : true;
    const currencyMatches = transaction.currency === body.currency;

    if (!statusMatches || !referenceMatches || !amountMatches || !currencyMatches) {
      return NextResponse.json(
        {
          verified: false,
          message: !statusMatches
            ? "Flutterwave payment was not successful."
            : !referenceMatches
              ? "Flutterwave reference did not match the generated transaction reference."
              : !amountMatches
                ? "Flutterwave payment amount did not match the order total."
                : "Flutterwave payment currency did not match the order currency."
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      verified: true,
      message: "Flutterwave payment verified successfully.",
      transaction: {
        id: transaction.id,
        txRef: transaction.tx_ref,
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
