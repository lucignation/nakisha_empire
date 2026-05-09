import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromCookies } from "@/lib/server/admin-auth";
import { sendBackInStockNotifications } from "@/lib/server/back-in-stock";
import { deleteProductImage, uploadProductImage } from "@/lib/server/cloudinary";
import {
  createInventoryLogIfNeeded,
  normalizeProductGalleryImages,
  parseListField,
  parseProductGalleryImagesField,
  productUpdateSchema,
  resolveInventoryState,
  toProductGalleryImagesInput
} from "@/lib/server/product-admin";

interface RouteContext {
  params: {
    id: string;
  };
}

export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext) {
  let uploadedImage: { secure_url: string; public_id: string } | null = null;
  const uploadedGalleryImages: Array<{ secure_url: string; public_id: string }> = [];

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
        trackInventory: true,
        isOutOfStock: true,
        cloudinaryPublicId: true,
        galleryImages: true
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
    const galleryImages = formData.getAll("galleryImages");
    const existingGalleryMedia = normalizeProductGalleryImages(existingProduct.galleryImages);
    const retainedGalleryMedia = formData.has("galleryMedia")
      ? parseProductGalleryImagesField(formData.get("galleryMedia"))
      : existingGalleryMedia;

    if (image instanceof File && image.size > 0) {
      uploadedImage = await uploadProductImage(image);
    }

    for (const galleryImage of galleryImages) {
      if (galleryImage instanceof File && galleryImage.size > 0) {
        uploadedGalleryImages.push(await uploadProductImage(galleryImage));
      }
    }

    const payload = productUpdateSchema.parse({
      name: formData.get("name"),
      shortDescription: formData.get("shortDescription"),
      description: formData.get("description"),
      category: formData.get("category"),
      brand: formData.get("brand"),
      size: formData.get("size"),
      price: formData.get("price"),
      salePrice: formData.get("salePrice"),
      promoStartsAt: formData.get("promoStartsAt"),
      promoEndsAt: formData.get("promoEndsAt"),
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
    const wasAvailable = existingProduct.trackInventory
      ? !existingProduct.isOutOfStock && existingProduct.stockQuantity > 0
      : !existingProduct.isOutOfStock;
    const removedGalleryPublicIds = existingGalleryMedia.flatMap((item) => {
      if (!item.publicId) {
        return [];
      }

      return retainedGalleryMedia.some((retainedItem) => retainedItem.publicId === item.publicId) ? [] : [item.publicId];
    });
    const nextGalleryMedia = [
      ...retainedGalleryMedia,
      ...uploadedGalleryImages.map((galleryImage) => ({
        url: galleryImage.secure_url,
        publicId: galleryImage.public_id
      }))
    ];

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
          salePrice: payload.salePrice ?? null,
          promoStartsAt: payload.promoStartsAt ?? null,
          promoEndsAt: payload.promoEndsAt ?? null,
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
          galleryImages: toProductGalleryImagesInput(nextGalleryMedia),
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

    const isAvailableNow = payload.trackInventory ? !inventoryState.isOutOfStock && inventoryState.stockQuantity > 0 : !inventoryState.isOutOfStock;

    if (!wasAvailable && isAvailableNow) {
      void sendBackInStockNotifications(context.params.id).catch((error) => {
        console.error("Unable to send back-in-stock notifications automatically", error);
      });
    }

    for (const publicId of removedGalleryPublicIds) {
      void deleteProductImage(publicId).catch((error) => {
        console.error("Unable to remove previous gallery image", error);
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

    for (const galleryImage of uploadedGalleryImages) {
      try {
        await deleteProductImage(galleryImage.public_id);
      } catch (cleanupError) {
        console.error("Unable to clean up uploaded Cloudinary gallery image after failure", cleanupError);
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
