import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth/session";
import { jsonSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const [
      totalOrders,
      paidOrders,
      pendingOrders,
      awaitingPayment,
      recentOrders,
      products,
      customerCount,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.find({ paymentStatus: "paid" }).select("total").lean(),
      Order.countDocuments({ orderStatus: "pending" }),
      Order.countDocuments({ orderStatus: "awaiting_payment" }),
      Order.find().sort({ createdAt: -1 }).limit(10).lean(),
      Product.find({ isActive: true }).select("nameEn variants").lean(),
      User.countDocuments({ role: "customer" }),
    ]);

    const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

    const lowStock = [];
    for (const p of products) {
      for (const v of p.variants || []) {
        if (v.isActive && v.stock <= (v.lowStockThreshold || 5)) {
          lowStock.push({ product: p.nameEn, size: v.sizeLabelEn, stock: v.stock, sku: v.sku });
        }
      }
    }

    return jsonSuccess({
      metrics: {
        totalOrders,
        revenue,
        pendingOrders,
        awaitingPayment,
        customerCount,
        lowStockCount: lowStock.length,
      },
      lowStock: lowStock.slice(0, 20),
      recentOrders,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
