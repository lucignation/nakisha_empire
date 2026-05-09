import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const optionalNumberField = z.preprocess(
  (value) => (value === "" || value === null || typeof value === "undefined" ? undefined : value),
  z.coerce.number().int().nonnegative().optional()
);

const optionalDateField = z.preprocess(
  (value) => (value === "" || value === null || typeof value === "undefined" ? undefined : value),
  z.coerce.date().optional()
);

const baseProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  shortDescription: z.string().min(8),
  description: z.string().min(20),
  category: z.string().min(2),
  brand: z.string().min(2),
  size: z.string().min(1),
  price: z.coerce.number().int().nonnegative(),
  salePrice: optionalNumberField.nullish(),
  promoStartsAt: optionalDateField.nullish(),
  promoEndsAt: optionalDateField.nullish(),
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
  isOutOfStock: z.boolean().default(false)
});

const productGalleryImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional().nullable()
});

function refinePricing<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((data, ctx) => {
    const payload = data as {
      price: number;
      salePrice?: number | null;
      promoStartsAt?: Date | null;
      promoEndsAt?: Date | null;
    };

    if (typeof payload.salePrice === "number" && payload.salePrice >= payload.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salePrice"],
        message: "Promo price must be lower than the regular price."
      });
    }

    if ((payload.promoStartsAt && !payload.promoEndsAt) || (!payload.promoStartsAt && payload.promoEndsAt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["promoEndsAt"],
        message: "Add both promo start and promo end dates for a scheduled sale."
      });
    }

    if (payload.promoStartsAt && payload.promoEndsAt && payload.promoEndsAt <= payload.promoStartsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["promoEndsAt"],
        message: "Promo end date must be after the promo start date."
      });
    }
  });
}

export const productCreateSchema = refinePricing(
  baseProductSchema.extend({
    imageUrl: z.string().url(),
    cloudinaryPublicId: z.string().optional().nullable()
  })
);

export const productUpdateSchema = refinePricing(
  baseProductSchema.omit({
    slug: true
  }).extend({
    badge: z.string().optional().default("Featured")
  })
);

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductGalleryImage = z.infer<typeof productGalleryImageSchema>;

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

export function normalizeProductGalleryImages(value: unknown): ProductGalleryImage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const parsed = productGalleryImageSchema.array().safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function parseProductGalleryImagesField(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return normalizeProductGalleryImages(parsed);
  } catch {
    return [];
  }
}

export function toProductGalleryImagesInput(images: ProductGalleryImage[]): Prisma.InputJsonValue {
  return images as Prisma.InputJsonValue;
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
