import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth/session";
import { jsonSuccess, handleApiError } from "@/lib/api-response";

const DAY_MS = 24 * 60 * 60 * 1000;
const TREND_DAYS = 30;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fillTrendSeries(rows, days) {
  const byDay = new Map(rows.map((r) => [r._id, r]));
  const series = [];
  const today = startOfDay(new Date());

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(today.getTime() - i * DAY_MS);
    const key = formatDayKey(day);
    const row = byDay.get(key);
    series.push({
      date: key,
      label: day.toLocaleDateString("en-PK", { month: "short", day: "numeric" }),
      orders: row?.orders || 0,
      revenue: row?.revenue || 0,
    });
  }
  return series;
}

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const trendSince = startOfDay(new Date(Date.now() - (TREND_DAYS - 1) * DAY_MS));

    const [
      totalOrders,
      paidOrders,
      pendingOrders,
      awaitingPayment,
      paymentReview,
      recentOrders,
      products,
      customerCount,
      trendRaw,
      statusRaw,
      paymentMethodRaw,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.find({ paymentStatus: "paid" }).select("total").lean(),
      Order.countDocuments({ orderStatus: "pending" }),
      Order.countDocuments({ orderStatus: "awaiting_payment" }),
      Order.countDocuments({ orderStatus: "payment_review" }),
      Order.find()
        .select("-accessToken -paymentGatewayResponse")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Product.find({ isActive: true }).select("nameEn variants").lean(),
      User.countDocuments({ role: "customer" }),
      Order.aggregate([
        { $match: { createdAt: { $gte: trendSince } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            orders: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: "$paymentMethod",
            count: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0],
              },
            },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

    const lowStock = [];
    for (const p of products) {
      for (const v of p.variants || []) {
        if (v.isActive && v.stock <= (v.lowStockThreshold || 5)) {
          lowStock.push({
            product: p.nameEn,
            size: v.sizeLabelEn,
            stock: v.stock,
            sku: v.sku,
          });
        }
      }
    }

    const trend = fillTrendSeries(trendRaw, TREND_DAYS);
    const ordersLast30 = trend.reduce((sum, d) => sum + d.orders, 0);
    const revenueLast30 = trend.reduce((sum, d) => sum + d.revenue, 0);

    const byStatus = statusRaw.map((r) => ({
      status: r._id || "unknown",
      label: String(r._id || "unknown").replace(/_/g, " "),
      count: r.count,
    }));

    const byPaymentMethod = paymentMethodRaw.map((r) => ({
      method: r._id || "unknown",
      label: String(r._id || "unknown").replace(/_/g, " "),
      count: r.count,
      revenue: r.revenue || 0,
    }));

    return jsonSuccess({
      metrics: {
        totalOrders,
        revenue,
        pendingOrders,
        awaitingPayment,
        paymentReview,
        customerCount,
        lowStockCount: lowStock.length,
        ordersLast30,
        revenueLast30,
      },
      charts: {
        trend,
        byStatus,
        byPaymentMethod,
      },
      lowStock: lowStock.slice(0, 20),
      recentOrders,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
