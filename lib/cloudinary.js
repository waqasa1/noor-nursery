import { v2 as cloudinary } from "cloudinary";
import { getEnv } from "@/lib/env";

export function isCloudinaryConfigured() {
  const env = getEnv();
  return !!(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  );
}

function ensureConfigured() {
  if (!isCloudinaryConfigured()) {
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }
  const env = getEnv();
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadImageBuffer(buffer, { folder = "noor-nursery/products" } = {}) {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}
