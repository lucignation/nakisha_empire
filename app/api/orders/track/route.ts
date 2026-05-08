import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const orderTrackingSchema = z.object({
  reference: z.string().min(3),
  email: z.string().email()
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          message: "DATABASE_URL is missing. Order tracking is unavailable."
        },
        { status: 500 }
      );
    }

    const body = orderTrackingSchema.parse(await request.json());
    const normalizedReference = body.reference.trim();
    const normalizedEmail = body.email.trim().toLowerCase();

    const order = await prisma.order.findFirst({
      where: {
        customerEmail: normalizedEmail,
        OR: [
          { orderNumber: { equals: normalizedReference.toUpperCase(), mode: "insensitive" } },
          { paymentReference: { equals: normalizedReference, mode: "insensitive" } }
        ]
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        status: true,
        paymentGateway: true,
        paymentReference: true,
        subtotalAmount: true,
        discountAmount: true,
        shippingAmount: true,
        totalAmount: true,
        promoCode: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "No order matched that reference and email combination."
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Tracking form is invalid.",
          issues: error.flatten()
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected order tracking error."
      },
      { status: 500 }
    );
  }
}
