import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSessionFromCookies } from "@/lib/server/admin-auth";
import { saveDeliveryRates } from "@/lib/server/delivery-rates";

const deliveryRateSchema = z.object({
  stateCode: z.string().min(2),
  stateName: z.string().min(2),
  feeAmount: z.number().int().nonnegative()
});

const saveDeliveryRatesSchema = z.object({
  rates: z.array(deliveryRateSchema).min(1)
});

export async function PUT(request: Request) {
  try {
    if (!getAdminSessionFromCookies()) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized."
        },
        { status: 401 }
      );
    }

    const body = saveDeliveryRatesSchema.parse(await request.json());
    const rates = await saveDeliveryRates(
      body.rates.map((rate) => ({
        stateCode: String(rate.stateCode),
        stateName: String(rate.stateName),
        feeAmount: Number(rate.feeAmount)
      }))
    );

    return NextResponse.json({
      success: true,
      rates
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "The delivery-rate payload is invalid.",
          issues: error.flatten()
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected delivery-rate update error."
      },
      { status: 500 }
    );
  }
}
