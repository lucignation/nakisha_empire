import { unstable_noStore as noStore } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { products as fallbackProducts, type Product } from "@/lib/data";
import { normalizeProductGalleryImages, type ProductGalleryImage } from "@/lib/server/product-admin";

const productSelect = {
  id: true,
  slug: true,
  name: true,
  shortDescription: true,
  description: true,
  category: true,
  brand: true,
  size: true,
  price: true,
  salePrice: true,
  promoStartsAt: true,
  promoEndsAt: true,
  rating: true,
  reviewCount: true,
  badge: true,
  emoji: true,
  accent: true,
  imageUrl: true,
  cloudinaryPublicId: true,
  galleryImages: true,
  skinGoal: true,
  collection: true,
  highlights: true,
  ingredients: true,
  howToUse: true,
  sku: true,
  isPublished: true,
  trackInventory: true,
  stockQuantity: true,
  isOutOfStock: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.ProductSelect;

type ProductRecord = Prisma.ProductGetPayload<{ select: typeof productSelect }>;
const legacyProductSelect = {
  id: true,
  slug: true,
  name: true,
  shortDescription: true,
  description: true,
  category: true,
  brand: true,
  size: true,
  price: true,
  salePrice: true,
  promoStartsAt: true,
  promoEndsAt: true,
  rating: true,
  reviewCount: true,
  badge: true,
  emoji: true,
  accent: true,
  imageUrl: true,
  cloudinaryPublicId: true,
  skinGoal: true,
  collection: true,
  highlights: true,
  ingredients: true,
  howToUse: true,
  sku: true,
  isPublished: true,
  trackInventory: true,
  stockQuantity: true,
  isOutOfStock: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.ProductSelect;

type LegacyProductRecord = Prisma.ProductGetPayload<{ select: typeof legacyProductSelect }>;
let productQueryMode: "full" | "legacy" = "full";

export interface AdminProductRecord extends Product {
  id: string;
  galleryMedia: ProductGalleryImage[];
}

export interface InventoryActivityRecord {
  id: string;
  productId: string;
  productName: string;
  quantityBefore: number;
  quantityAfter: number;
  changeAmount: number;
  reason: string;
  createdAt: string;
}

function formatReviewCount(value: number) {
  if (value >= 1000) {
    const compact = value / 1000;
    return Number.isInteger(compact) ? `${compact}k` : `${compact.toFixed(1)}k`;
  }

  return `${value}`;
}

function ratingToStars(rating: number) {
  const rounded = Math.round(rating);
  return `${"★".repeat(Math.max(0, Math.min(5, rounded)))}${"☆".repeat(Math.max(0, 5 - rounded))}`;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function isMissingColumnError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022";
}

function mapDatabaseProduct(product: ProductRecord | LegacyProductRecord): AdminProductRecord {
  const galleryMedia = "galleryImages" in product ? normalizeProductGalleryImages(product.galleryImages) : [];
  const images = [product.imageUrl, ...galleryMedia.map((item) => item.url)];

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    category: product.category,
    brand: product.brand,
    size: product.size,
    price: product.price,
    salePrice: product.salePrice,
    promoStartsAt: product.promoStartsAt?.toISOString() ?? null,
    promoEndsAt: product.promoEndsAt?.toISOString() ?? null,
    rating: product.rating,
    reviewCount: formatReviewCount(product.reviewCount),
    badge: product.badge ?? "Featured",
    emoji: product.emoji ?? "✨",
    accent: product.accent ?? "gold",
    image: product.imageUrl,
    images,
    cloudinaryPublicId: product.cloudinaryPublicId,
    galleryMedia,
    skinGoal: product.skinGoal,
    collection: product.collection,
    stars: ratingToStars(product.rating),
    highlights: normalizeStringArray(product.highlights),
    ingredients: normalizeStringArray(product.ingredients),
    howToUse: product.howToUse,
    sku: product.sku,
    isPublished: product.isPublished,
    trackInventory: product.trackInventory,
    stockQuantity: product.stockQuantity,
    isOutOfStock: product.isOutOfStock,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString()
  };
}

function getFallbackProducts(): AdminProductRecord[] {
  return fallbackProducts.map((product, index) => ({
    ...product,
    id: `fallback-${product.slug}`,
    images: product.images?.length ? product.images : [product.image],
    badge: product.badge || "Featured",
    emoji: product.emoji || "✨",
    accent: product.accent || "gold",
    cloudinaryPublicId: null,
    galleryMedia: [],
    sku: `SKU-${String(index + 1).padStart(4, "0")}`,
    isPublished: true,
    trackInventory: false,
    stockQuantity: 100,
    isOutOfStock: false
  }));
}

function databaseIsConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

async function fetchDatabaseProducts(where?: Prisma.ProductWhereInput) {
  if (!databaseIsConfigured()) {
    return null;
  }

  if (productQueryMode === "legacy") {
    try {
      const legacyRecords = await prisma.product.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        select: legacyProductSelect
      });

      return legacyRecords.map(mapDatabaseProduct);
    } catch (legacyError) {
      console.error("Unable to query products from Prisma/Neon using the legacy schema fallback", legacyError);
      return null;
    }
  }

  try {
    const records = await prisma.product.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      select: productSelect
    });

    return records.map(mapDatabaseProduct);
  } catch (error) {
    if (isMissingColumnError(error)) {
      productQueryMode = "legacy";

      try {
        const legacyRecords = await prisma.product.findMany({
          where,
          orderBy: [{ createdAt: "desc" }],
          select: legacyProductSelect
        });

        return legacyRecords.map(mapDatabaseProduct);
      } catch (legacyError) {
        console.error("Unable to query products from Prisma/Neon using the legacy schema fallback", legacyError);
        return null;
      }
    }

    console.error("Unable to query products from Prisma/Neon", error);
    return null;
  }
}

export async function getStorefrontProducts(): Promise<Product[]> {
  noStore();
  const databaseProducts = await fetchDatabaseProducts({ isPublished: true });

  if (databaseProducts && databaseProducts.length > 0) {
    return databaseProducts as Product[];
  }

  return getFallbackProducts() as Product[];
}

export async function getAdminProducts(): Promise<AdminProductRecord[]> {
  noStore();
  const databaseProducts = await fetchDatabaseProducts();

  if (databaseProducts) {
    return databaseProducts;
  }

  return getFallbackProducts();
}

export async function getAdminProductById(id: string): Promise<AdminProductRecord | null> {
  noStore();

  if (databaseIsConfigured()) {
    if (productQueryMode === "legacy") {
      try {
        const legacyProduct = await prisma.product.findUnique({
          where: { id },
          select: legacyProductSelect
        });

        return legacyProduct ? mapDatabaseProduct(legacyProduct) : null;
      } catch (legacyError) {
        console.error(`Unable to query admin product ${id} from Prisma/Neon using the legacy schema fallback`, legacyError);
      }
    }

    try {
      const product = await prisma.product.findUnique({
        where: { id },
        select: productSelect
      });

      if (product) {
        return mapDatabaseProduct(product);
      }
    } catch (error) {
      if (isMissingColumnError(error)) {
        productQueryMode = "legacy";

        try {
          const legacyProduct = await prisma.product.findUnique({
            where: { id },
            select: legacyProductSelect
          });

          if (legacyProduct) {
            return mapDatabaseProduct(legacyProduct);
          }
        } catch (legacyError) {
          console.error(`Unable to query admin product ${id} from Prisma/Neon using the legacy schema fallback`, legacyError);
        }
      }

      console.error(`Unable to query admin product ${id} from Prisma/Neon`, error);
    }
  }

  return getFallbackProducts().find((product) => product.id === id) ?? null;
}

export async function getRecentInventoryLogs(limit = 8): Promise<InventoryActivityRecord[]> {
  noStore();

  if (!databaseIsConfigured()) {
    return [];
  }

  try {
    const logs = await prisma.inventoryLog.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: limit,
      select: {
        id: true,
        productId: true,
        quantityBefore: true,
        quantityAfter: true,
        changeAmount: true,
        reason: true,
        createdAt: true,
        product: {
          select: {
            name: true
          }
        }
      }
    });

    return logs.map((log) => ({
      id: log.id,
      productId: log.productId,
      productName: log.product?.name ?? "Unknown product",
      quantityBefore: log.quantityBefore,
      quantityAfter: log.quantityAfter,
      changeAmount: log.changeAmount,
      reason: log.reason,
      createdAt: log.createdAt.toISOString()
    }));
  } catch (error) {
    console.error("Unable to query inventory logs from Prisma/Neon", error);
    return [];
  }
}

export async function getStorefrontProductBySlug(slug: string): Promise<Product | undefined> {
  noStore();

  if (databaseIsConfigured()) {
    if (productQueryMode === "legacy") {
      try {
        const legacyProduct = await prisma.product.findFirst({
          where: {
            slug,
            isPublished: true
          },
          select: legacyProductSelect
        });

        if (legacyProduct) {
          return mapDatabaseProduct(legacyProduct);
        }
      } catch (legacyError) {
        console.error(`Unable to query product ${slug} from Prisma/Neon using the legacy schema fallback`, legacyError);
      }
    }

    try {
      const product = await prisma.product.findFirst({
        where: {
          slug,
          isPublished: true
        },
        select: productSelect
      });

      if (product) {
        return mapDatabaseProduct(product);
      }
    } catch (error) {
      if (isMissingColumnError(error)) {
        productQueryMode = "legacy";

        try {
          const legacyProduct = await prisma.product.findFirst({
            where: {
              slug,
              isPublished: true
            },
            select: legacyProductSelect
          });

          if (legacyProduct) {
            return mapDatabaseProduct(legacyProduct);
          }
        } catch (legacyError) {
          console.error(`Unable to query product ${slug} from Prisma/Neon using the legacy schema fallback`, legacyError);
        }
      }

      console.error(`Unable to query product ${slug} from Prisma/Neon`, error);
    }
  }

  return getFallbackProducts().find((product) => product.slug === slug);
}

export function getFeaturedStorefrontProducts(products: Product[]) {
  return products.slice(0, 4);
}
