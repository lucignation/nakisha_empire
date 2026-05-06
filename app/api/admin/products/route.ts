import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromCookies } from "@/lib/server/admin-auth";
import { uploadProductImage } from "@/lib/server/cloudinary";
import {
  createInventoryLogIfNeeded,
  ensureUniqueProductSlug,
  parseListField,
  productCreateSchema,
  resolveInventoryState
} from "@/lib/server/product-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
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

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          message: "DATABASE_URL is missing. Connect Neon before creating products."
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "A product image is required."
        },
        { status: 400 }
      );
    }

    const uploadedImage = await uploadProductImage(image);

    const parsed = productCreateSchema.parse({
      name: formData.get("name"),
      slug: formData.get("slug") || undefined,
      shortDescription: formData.get("shortDescription"),
      description: formData.get("description"),
      category: formData.get("category"),
      brand: formData.get("brand"),
      size: formData.get("size"),
      price: formData.get("price"),
      badge: formData.get("badge") || "New",
      collection: formData.get("collection"),
      skinGoal: formData.get("skinGoal"),
      howToUse: formData.get("howToUse"),
      sku: formData.get("sku") || undefined,
      highlights: parseListField(String(formData.get("highlights") || "")),
      ingredients: parseListField(String(formData.get("ingredients") || "")),
      trackInventory: String(formData.get("trackInventory")) === "true",
      stockQuantity: formData.get("stockQuantity"),
      isOutOfStock: String(formData.get("isOutOfStock")) === "true",
      isPublished: String(formData.get("isPublished")) === "true",
      imageUrl: uploadedImage.secure_url,
      cloudinaryPublicId: uploadedImage.public_id
    });

    const slug = await ensureUniqueProductSlug(parsed.slug || parsed.name);
    const inventoryState = resolveInventoryState({
      trackInventory: parsed.trackInventory,
      stockQuantity: parsed.stockQuantity,
      isOutOfStock: parsed.isOutOfStock
    });

    const createdProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          slug,
          name: parsed.name,
          shortDescription: parsed.shortDescription,
          description: parsed.description,
          category: parsed.category,
          brand: parsed.brand,
          size: parsed.size,
          price: parsed.price,
          rating: 0,
          reviewCount: 0,
          badge: parsed.badge,
          emoji: "✨",
          accent: "gold",
          imageUrl: parsed.imageUrl,
          cloudinaryPublicId: parsed.cloudinaryPublicId,
          skinGoal: parsed.skinGoal,
          collection: parsed.collection,
          highlights: parsed.highlights,
          ingredients: parsed.ingredients,
          howToUse: parsed.howToUse,
          sku: parsed.sku,
          isPublished: parsed.isPublished,
          trackInventory: parsed.trackInventory,
          stockQuantity: inventoryState.stockQuantity,
          isOutOfStock: inventoryState.isOutOfStock
        }
      });

      await createInventoryLogIfNeeded({
        tx,
        productId: product.id,
        quantityBefore: 0,
        quantityAfter: inventoryState.stockQuantity,
        reason: "Initial stock on product creation"
      });

      return product;
    });

    return NextResponse.json({
      success: true,
      productId: createdProduct.id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "The product form is incomplete or invalid.",
          issues: error.flatten()
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected product creation error."
      },
      { status: 500 }
    );
  }
}
