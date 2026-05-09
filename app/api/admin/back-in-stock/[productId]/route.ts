import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/server/admin-auth";
import { sendBackInStockNotifications } from "@/lib/server/back-in-stock";

export async function POST(_request: Request, context: { params: { productId: string } }) {
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

    const result = await sendBackInStockNotifications(context.params.productId);

    return NextResponse.json({
      success: true,
      sentCount: result.sentCount
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected back-in-stock notification error."
      },
      { status: 500 }
    );
  }
}
