import { NextResponse } from "next/server";
import { PaymentGateway } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendOrderReceivedEmail } from "@/lib/server/commerce-email";
import { createInventoryLogIfNeeded } from "@/lib/server/product-admin";
import { verifyFlutterwaveTransaction, verifyPaystackTransaction } from "@/lib/server/payment-verification";
import { validatePromoCodeForOrder } from "@/lib/server/promos";

const checkoutOrderSchema = z.object({
  gateway: z.nativeEnum(PaymentGateway),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional().nullable(),
  deliveryAddress: z.string().min(8),
  deliveryStateCode: z.string().min(2),
  deliveryStateName: z.string().min(2),
  paymentReference: z.string().min(3),
  transactionId: z.number().int().positive().optional(),
  subtotalAmount: z.number().int().nonnegative(),
  discountAmount: z.number().int().nonnegative().default(0),
  shippingAmount: z.number().int().nonnegative(),
  totalAmount: z.number().int().positive(),
  promoCode: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().optional().nullable(),
        slug: z.string().min(1),
        name: z.string().min(1),
        quantity: z.number().int().positive(),
        price: z.number().int().nonnegative()
      })
    )
    .min(1)
});

function generateOrderNumber() {
  return `NKE-${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

async function createUniqueOrderNumber() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderNumber = generateOrderNumber();
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true }
    });

    if (!existingOrder) {
      return orderNumber;
    }
  }

  throw new Error("Unable to generate a unique order number right now.");
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          message: "DATABASE_URL is missing. Order persistence is unavailable."
        },
        { status: 500 }
      );
    }

    const body = checkoutOrderSchema.parse(await request.json());
    const appliedPromoCode = body.promoCode?.trim() ? body.promoCode.trim().toUpperCase() : null;
    let validatedDiscountAmount = 0;

    if (body.gateway === "PAYSTACK") {
      await verifyPaystackTransaction({
        reference: body.paymentReference,
        expectedAmount: body.totalAmount * 100,
        currency: "NGN"
      });
    } else {
      if (!body.transactionId) {
        return NextResponse.json(
          {
            success: false,
            message: "Flutterwave transaction id is required."
          },
          { status: 400 }
        );
      }

      await verifyFlutterwaveTransaction({
        transactionId: body.transactionId,
        txRef: body.paymentReference,
        expectedAmount: body.totalAmount,
        currency: "NGN"
      });
    }

    if (appliedPromoCode) {
      const promoValidation = await validatePromoCodeForOrder({
        code: appliedPromoCode,
        subtotalAmount: body.subtotalAmount
      });

      validatedDiscountAmount = promoValidation.discountAmount;
    }

    const expectedTotalAmount = body.subtotalAmount + body.shippingAmount - validatedDiscountAmount;

    if (validatedDiscountAmount !== body.discountAmount || expectedTotalAmount !== body.totalAmount) {
      return NextResponse.json(
        {
          success: false,
          message: "Order totals no longer match the active discount rules. Refresh the cart and try again."
        },
        { status: 409 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { paymentReference: body.paymentReference },
      select: {
        id: true,
        orderNumber: true
      }
    });

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        orderNumber: existingOrder.orderNumber,
        orderId: existingOrder.id,
        duplicated: true
      });
    }

    const requestedSlugs = body.items.map((item) => item.slug);
    const dbProducts = await prisma.product.findMany({
      where: {
        slug: { in: requestedSlugs }
      },
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        trackInventory: true,
        stockQuantity: true,
        isOutOfStock: true
      }
    });

    const productsBySlug = new Map(dbProducts.map((product) => [product.slug, product]));

    for (const item of body.items) {
      const product = productsBySlug.get(item.slug);

      if (!product) {
        continue;
      }

      if (product.trackInventory) {
        if (product.isOutOfStock || product.stockQuantity < item.quantity) {
          return NextResponse.json(
            {
              success: false,
              message: `${product.name} no longer has enough stock to complete this order.`
            },
            { status: 409 }
          );
        }
      }
    }

    const orderNumber = await createUniqueOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: body.customerName.trim(),
          customerEmail: body.customerEmail.trim().toLowerCase(),
          customerPhone: body.customerPhone?.trim() || null,
          deliveryAddress: body.deliveryAddress.trim(),
          deliveryStateCode: body.deliveryStateCode.trim().toUpperCase(),
          deliveryStateName: body.deliveryStateName.trim(),
          status: "PENDING",
          paymentGateway: body.gateway,
          paymentReference: body.paymentReference,
          subtotalAmount: body.subtotalAmount,
          discountAmount: validatedDiscountAmount,
          shippingAmount: body.shippingAmount,
          totalAmount: body.totalAmount,
          promoCode: appliedPromoCode,
          items: {
            create: body.items.map((item) => {
              const product = productsBySlug.get(item.slug);

              return {
                productId: product?.id ?? item.productId ?? null,
                productName: item.name,
                quantity: item.quantity,
                unitPrice: item.price,
                totalPrice: item.price * item.quantity
              };
            })
          }
        }
      });

      for (const item of body.items) {
        const product = productsBySlug.get(item.slug);

        if (!product || !product.trackInventory) {
          continue;
        }

        const nextQuantity = Math.max(0, product.stockQuantity - item.quantity);

        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: nextQuantity,
            isOutOfStock: nextQuantity === 0
          }
        });

        await createInventoryLogIfNeeded({
          tx,
          productId: product.id,
          quantityBefore: product.stockQuantity,
          quantityAfter: nextQuantity,
          reason: `Customer purchase ${orderNumber}`
        });
      }

      if (appliedPromoCode) {
        await tx.promoCode.update({
          where: {
            code: appliedPromoCode
          },
          data: {
            usageCount: {
              increment: 1
            }
          }
        });
      }

      return createdOrder;
    });

    void sendOrderReceivedEmail(order.id).catch((emailError) => {
      console.error("Unable to send order confirmation email", emailError);
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Order payload is invalid.",
          issues: error.flatten()
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected order completion error."
      },
      { status: 500 }
    );
  }
}
