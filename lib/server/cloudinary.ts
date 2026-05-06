import { v2 as cloudinary } from "cloudinary";

let cloudinaryConfigured = false;

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function ensureCloudinaryConfigured() {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  }

  if (!cloudinaryConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    cloudinaryConfigured = true;
  }

  return cloudinary;
}

export async function uploadProductImage(file: File) {
  const client = ensureCloudinaryConfigured();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  return client.uploader.upload(dataUri, {
    folder: "nakisha-empire/products",
    resource_type: "image"
  });
}

export async function deleteProductImage(publicId?: string | null) {
  if (!publicId) {
    return;
  }

  const client = ensureCloudinaryConfigured();

  await client.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: "image"
  });
}
