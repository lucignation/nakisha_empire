import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromCookies } from "@/lib/server/admin-auth";
import { deleteProductImage, uploadProductImage } from "@/lib/server/cloudinary";
import {
  createInventoryLogIfNeeded,
  parseListField,
  productUpdateSchema,
  resolveInventoryState
} from "@/lib/server/product-admin";

interface RouteContext {
  params: {
    id: string;
  };
}

export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext) {
  let uploadedImage: { secure_url: string; public_id: string } | null = null;

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
          message: "DATABASE_URL is missing. Connect Neon before updating products."
        },
        { status: 500 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: context.params.id },
      select: {
        id: true,
        stockQuantity: true,
        cloudinaryPublicId: true
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found."
        },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (image instanceof File && image.size > 0) {
      uploadedImage = await uploadProductImage(image);
    }

    const payload = productUpdateSchema.parse({
      name: formData.get("name"),
      shortDescription: formData.get("shortDescription"),
      description: formData.get("description"),
      category: formData.get("category"),
      brand: formData.get("brand"),
      size: formData.get("size"),
      price: formData.get("price"),
      badge: formData.get("badge") || "Featured",
      collection: formData.get("collection"),
      skinGoal: formData.get("skinGoal"),
      highlights: parseListField(String(formData.get("highlights") || "")),
      ingredients: parseListField(String(formData.get("ingredients") || "")),
      howToUse: formData.get("howToUse"),
      sku: formData.get("sku") || undefined,
      isPublished: String(formData.get("isPublished")) === "true",
      trackInventory: String(formData.get("trackInventory")) === "true",
      stockQuantity: formData.get("stockQuantity"),
      isOutOfStock: String(formData.get("isOutOfStock")) === "true"
    });
    const inventoryState = resolveInventoryState({
      trackInventory: payload.trackInventory,
      stockQuantity: payload.stockQuantity,
      isOutOfStock: payload.isOutOfStock
    });

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: context.params.id },
        data: {
          name: payload.name,
          shortDescription: payload.shortDescription,
          description: payload.description,
          category: payload.category,
          brand: payload.brand,
          size: payload.size,
          price: payload.price,
          badge: payload.badge,
          collection: payload.collection,
          skinGoal: payload.skinGoal,
          highlights: payload.highlights,
          ingredients: payload.ingredients,
          howToUse: payload.howToUse,
          sku: payload.sku,
          isPublished: payload.isPublished,
          trackInventory: payload.trackInventory,
          stockQuantity: inventoryState.stockQuantity,
          isOutOfStock: inventoryState.isOutOfStock,
          ...(uploadedImage
            ? {
                imageUrl: uploadedImage.secure_url,
                cloudinaryPublicId: uploadedImage.public_id
              }
            : {})
        }
      });

      await createInventoryLogIfNeeded({
        tx,
        productId: context.params.id,
        quantityBefore: existingProduct.stockQuantity,
        quantityAfter: inventoryState.stockQuantity,
        reason: "Super-admin stock update"
      });
    });

    if (uploadedImage && existingProduct.cloudinaryPublicId) {
      void deleteProductImage(existingProduct.cloudinaryPublicId).catch((error) => {
        console.error("Unable to remove previous Cloudinary image", error);
      });
    }

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    if (uploadedImage?.public_id) {
      try {
        await deleteProductImage(uploadedImage.public_id);
      } catch (cleanupError) {
        console.error("Unable to clean up uploaded Cloudinary image after failure", cleanupError);
      }
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "The product update payload is invalid.",
          issues: error.flatten()
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected product update error."
      },
      { status: 500 }
    );
  }
}
