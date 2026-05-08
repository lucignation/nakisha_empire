import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromCookies } from "@/lib/server/admin-auth";

const orderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus)
});

export async function PATCH(request: Request, context: { params: { id: string } }) {
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

    const body = orderStatusSchema.parse(await request.json());

    const updatedOrder = await prisma.order.update({
      where: { id: context.params.id },
      data: {
        status: body.status
      },
      select: {
        id: true,
        orderNumber: true,
        status: true
      }
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order status payload.",
          issues: error.flatten()
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected order update error."
      },
      { status: 500 }
    );
  }
}
