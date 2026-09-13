import { requireAdmin } from "@/lib/auth/session";
import { uploadImageBuffer, isCloudinaryConfigured } from "@/lib/cloudinary";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function GET() {
  return jsonSuccess({ configured: isCloudinaryConfigured() });
}

export async function POST(request) {
  try {
    await requireAdmin();

    if (!isCloudinaryConfigured()) {
      return jsonError("Cloudinary is not configured. Add CLOUDINARY_* env vars or paste an image URL.", 503);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "noor-nursery/products";

    if (!file || typeof file === "string") {
      return jsonError("No image file provided", 400);
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return jsonError("Only JPEG, PNG, WebP, and GIF images are allowed", 400);
    }

    if (file.size > MAX_BYTES) {
      return jsonError("Image must be 5 MB or smaller", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImageBuffer(buffer, { folder: String(folder) });

    return jsonSuccess({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    if (error.message === "CLOUDINARY_NOT_CONFIGURED") {
      return jsonError("Cloudinary is not configured", 503);
    }
    return handleApiError(error);
  }
}
