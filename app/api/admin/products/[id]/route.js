import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/auth/session";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id).populate("categoryId").lean();
    if (!product) return jsonError("Product not found", 404);
    return jsonSuccess({ product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!product) return jsonError("Product not found", 404);
    return jsonSuccess({ product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    await Product.findByIdAndUpdate(id, { isActive: false });
    return jsonSuccess({ message: "Product archived" });
  } catch (error) {
    return handleApiError(error);
  }
}
