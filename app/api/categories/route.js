import { connectDB, isDBConfigured } from "@/lib/db";
import Category from "@/models/Category";
import { jsonSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    if (!isDBConfigured()) {
      return jsonSuccess({ categories: [] });
    }

    await connectDB();
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, nameEn: 1 })
      .lean();

    return jsonSuccess({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}
