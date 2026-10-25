import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/auth/session";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";
import { revalidateCatalog } from "@/lib/cache/catalog";
import { productUpdateSchema } from "@/lib/validation/product";

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
    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );
    if (!product) return jsonError("Product not found", 404);
    revalidateCatalog({ slug: product.slug });
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
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { returnDocument: "after" }
    );
    if (product) revalidateCatalog({ slug: product.slug });
    return jsonSuccess({ message: "Product archived" });
  } catch (error) {
    return handleApiError(error);
  }
}
