import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/data";
import { getProductUrl, sendBackInStockEmail } from "@/lib/server/commerce-email";

export interface BackInStockSubscriptionRecord {
  id: string;
  email: string;
  createdAt: string;
  notifiedAt?: string | null;
}

function databaseIsConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export async function subscribeToBackInStock(input: { productId: string; email: string }) {
  if (!databaseIsConfigured()) {
    throw new Error("DATABASE_URL is missing. Back-in-stock subscriptions are unavailable.");
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    select: {
      id: true,
      name: true
    }
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  return prisma.backInStockSubscription.upsert({
    where: {
      productId_email: {
        productId: input.productId,
        email: normalizedEmail
      }
    },
    create: {
      productId: input.productId,
      email: normalizedEmail
    },
    update: {
      notifiedAt: null
    }
  });
}

export async function getBackInStockSubscriptions(productId: string): Promise<BackInStockSubscriptionRecord[]> {
  if (!databaseIsConfigured()) {
    return [];
  }

  const subscriptions = await prisma.backInStockSubscription.findMany({
    where: { productId },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      createdAt: true,
      notifiedAt: true
    }
  });

  return subscriptions.map((subscription) => ({
    id: subscription.id,
    email: subscription.email,
    createdAt: subscription.createdAt.toISOString(),
    notifiedAt: subscription.notifiedAt?.toISOString() ?? null
  }));
}

export async function sendBackInStockNotifications(productId: string) {
  if (!databaseIsConfigured()) {
    throw new Error("DATABASE_URL is missing. Back-in-stock notifications are unavailable.");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      price: true,
      salePrice: true,
      trackInventory: true,
      isOutOfStock: true,
      stockQuantity: true
    }
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  if (product.trackInventory ? product.isOutOfStock || product.stockQuantity <= 0 : product.isOutOfStock) {
    throw new Error("This product is still out of stock.");
  }

  const subscriptions = await prisma.backInStockSubscription.findMany({
    where: {
      productId,
      notifiedAt: null
    },
    select: {
      id: true,
      email: true
    }
  });

  let sentCount = 0;

  for (const subscription of subscriptions) {
    await sendBackInStockEmail({
      email: subscription.email,
      productName: product.name,
      productUrl: getProductUrl(product.slug),
      imageUrl: product.imageUrl,
      priceLabel: formatCurrency(product.salePrice ?? product.price)
    });

    await prisma.backInStockSubscription.update({
      where: { id: subscription.id },
      data: {
        notifiedAt: new Date()
      }
    });

    sentCount += 1;
  }

  return {
    sentCount
  };
}
