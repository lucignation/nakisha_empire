import { NextResponse } from "next/server";
import { z } from "zod";

const verifyPaystackSchema = z.object({
  reference: z.string().min(3),
  expectedAmount: z.number().int().positive().optional(),
  currency: z.string().min(3).default("NGN")
});

export async function POST(request: Request) {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        {
          verified: false,
          message: "PAYSTACK_SECRET_KEY is missing."
        },
        { status: 500 }
      );
    }

    const body = verifyPaystackSchema.parse(await request.json());

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(body.reference)}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      cache: "no-store"
    });

    const payload = (await response.json()) as {
      status?: boolean;
      message?: string;
      data?: {
        status?: string;
        amount?: number;
        currency?: string;
        reference?: string;
      };
    };

    if (!response.ok || !payload.status || !payload.data) {
      return NextResponse.json(
        {
          verified: false,
          message: payload.message ?? "Unable to verify Paystack payment."
        },
        { status: response.status || 500 }
      );
    }

    const transaction = payload.data;
    const amountMatches = body.expectedAmount ? transaction.amount === body.expectedAmount : true;
    const currencyMatches = transaction.currency === body.currency;
    const statusMatches = transaction.status === "success";

    if (!amountMatches || !currencyMatches || !statusMatches) {
      return NextResponse.json(
        {
          verified: false,
          message: !statusMatches
            ? "Paystack payment was not successful."
            : !amountMatches
              ? "Paystack payment amount did not match the order total."
              : "Paystack payment currency did not match the order currency."
        },
        { status: 400 }
      );
    }

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
