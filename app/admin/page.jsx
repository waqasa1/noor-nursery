"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminMetricsSkeleton, AdminPanelSkeleton } from "@/components/admin/AdminSkeleton";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { formatPKR } from "@/lib/utils/currency";
import {
  ClipboardList,
  Clock3,
  CreditCard,
  Package,
  Wallet,
  ArrowRight,
  AlertTriangle,
  Users,
  TrendingUp,
} from "lucide-react";

const METRIC_CARDS = [
  {
    key: "totalOrders",
    label: "Total Orders",
    href: "/admin/orders",
    icon: ClipboardList,
    format: (m) => m.totalOrders,
    hint: (m) => `${m.ordersLast30 ?? 0} in last 30 days`,
  },
  {
    key: "revenue",
    label: "Revenue (Paid)",
    href: "/admin/orders?paymentStatus=paid",
    icon: Wallet,
    format: (m) => formatPKR(m.revenue),
    hint: (m) => `${formatPKR(m.revenueLast30 ?? 0)} last 30 days`,
  },
  {
    key: "pendingOrders",
    label: "Pending Orders",
    href: "/admin/orders?orderStatus=pending",
    icon: Clock3,
    format: (m) => m.pendingOrders,
    hint: () => "Needs fulfillment",
  },
  {
    key: "awaitingPayment",
    label: "Awaiting Payment",
    href: "/admin/orders?orderStatus=awaiting_payment",
    icon: CreditCard,
    format: (m) => m.awaitingPayment,
    hint: (m) =>
      m.paymentReview > 0 ? `${m.paymentReview} in payment review` : "Unpaid checkouts",
  },
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const metrics = data?.metrics;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Orders, revenue trends, and stock that need attention.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {metrics?.customerCount != null && (
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-secondary" />
              {metrics.customerCount} customers
            </span>
          )}
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 font-semibold text-secondary transition hover:underline"
          >
            All orders <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {loading && (
        <>
          <AdminMetricsSkeleton />
          <AdminPanelSkeleton lines={6} />
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <AdminPanelSkeleton lines={5} />
            <AdminPanelSkeleton lines={5} />
          </div>
        </>
      )}

      {!loading && !data?.success && (
        <p className="mt-4 text-destructive">
          Unable to load dashboard. Ensure you are logged in as admin.
        </p>
      )}

      {!loading && metrics && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRIC_CARDS.map((card) => {
            const Icon = card.icon;
            const value = card.format(metrics);
            const className =
              "group relative block rounded-2xl border bg-card p-5 transition hover:border-secondary/50 hover:shadow-sm";

            const body = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <span className="rounded-xl bg-surface-low p-2 text-secondary">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-secondary/80" />
                  {card.hint(metrics)}
                </p>
                {card.href && (
                  <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-secondary opacity-80 transition group-hover:opacity-100">
                    View orders <ArrowRight className="h-3 w-3" />
                  </p>
                )}
              </>
            );

            if (card.href) {
              return (
                <Link key={card.key} href={card.href} className={className}>
                  {body}
                </Link>
              );
            }

            return (
              <div key={card.key} className="rounded-2xl border bg-card p-5">
                {body}
              </div>
            );
          })}
        </div>
      )}

      {!loading && data?.charts && <DashboardCharts charts={data.charts} />}

      {!loading && data?.lowStock?.length > 0 && (
        <div className="mt-8 rounded-2xl border border-destructive/20 bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-display font-bold text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Low Stock Alerts
            </h2>
            <Link
              href="/admin/products"
              className="text-sm font-semibold text-secondary hover:underline"
            >
              Manage products
            </Link>
          </div>
          <ul className="mt-3 divide-y text-sm">
            {data.lowStock.map((item, i) => (
              <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                <span>
                  <span className="font-medium">{item.product}</span>
                  <span className="text-muted-foreground"> · {item.size}</span>
                </span>
                <span className="tabular-nums text-destructive">
                  {item.stock} left
                  <span className="ml-2 text-muted-foreground">SKU {item.sku}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && data?.recentOrders?.length > 0 && (
        <div className="mt-8 rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-display font-bold">
              <Package className="h-4 w-4 text-secondary" />
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm font-semibold text-secondary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 font-medium">Order</th>
                  <th className="font-medium">Customer</th>
                  <th className="font-medium">Total</th>
                  <th className="font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o._id} className="border-b last:border-0">
                    <td className="py-2.5">
                      <Link
                        href={`/admin/orders/${o._id}`}
                        className="font-medium text-secondary hover:underline"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td>{o.customer?.name}</td>
                    <td>{formatPKR(o.total)}</td>
                    <td className="capitalize">{o.orderStatus.replace("_", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
