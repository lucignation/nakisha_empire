import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const productCreateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  shortDescription: z.string().min(8),
  description: z.string().min(20),
  category: z.string().min(2),
  brand: z.string().min(2),
  size: z.string().min(1),
  price: z.coerce.number().int().nonnegative(),
  badge: z.string().optional().default("New"),
  collection: z.string().min(2),
  skinGoal: z.string().min(2),
  howToUse: z.string().min(8),
  highlights: z.array(z.string().min(1)).min(1),
  ingredients: z.array(z.string().min(1)).min(1),
  sku: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
  trackInventory: z.boolean().default(true),
  stockQuantity: z.coerce.number().int().nonnegative().default(0),
  isOutOfStock: z.boolean().default(false),
  imageUrl: z.string().url(),
  cloudinaryPublicId: z.string().optional().nullable()
});

export const productUpdateSchema = z.object({
  name: z.string().min(2),
  shortDescription: z.string().min(8),
  description: z.string().min(20),
  category: z.string().min(2),
  brand: z.string().min(2),
  size: z.string().min(1),
  price: z.coerce.number().int().nonnegative(),
  badge: z.string().optional().default("Featured"),
  collection: z.string().min(2),
  skinGoal: z.string().min(2),
  highlights: z.array(z.string().min(1)).min(1),
  ingredients: z.array(z.string().min(1)).min(1),
  howToUse: z.string().min(8),
  sku: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
  trackInventory: z.boolean().default(true),
  stockQuantity: z.coerce.number().int().nonnegative().default(0),
  isOutOfStock: z.boolean().default(false)
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

export function resolveInventoryState(input: {
  trackInventory: boolean;
  stockQuantity: number;
  isOutOfStock: boolean;
}) {
  const stockQuantity = Math.max(0, input.stockQuantity);

  if (!input.trackInventory) {
    return {
      stockQuantity,
      isOutOfStock: input.isOutOfStock
    };
  }

  return {
    stockQuantity,
    isOutOfStock: stockQuantity === 0 ? true : input.isOutOfStock
  };
}

export function slugifyValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function parseListField(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function ensureUniqueProductSlug(rawSlug: string, excludeId?: string) {
  const baseSlug = slugifyValue(rawSlug) || `product-${Date.now()}`;
  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await prisma.product.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {})
      },
      select: { id: true }
    });

    if (!existing) {
      return candidate;
    }

    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}

export async function createInventoryLogIfNeeded(input: {
  tx: Prisma.TransactionClient;
  productId: string;
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
}) {
  const { tx, productId, quantityBefore, quantityAfter, reason } = input;

  if (quantityBefore === quantityAfter) {
    return;
  }

  await tx.inventoryLog.create({
    data: {
      productId,
      quantityBefore,
      quantityAfter,
      changeAmount: quantityAfter - quantityBefore,
      reason
    }
  });
}
