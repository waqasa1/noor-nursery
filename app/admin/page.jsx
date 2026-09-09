"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { formatPKR } from "@/lib/utils/currency";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/admin/dashboard").then((r) => r.json()).then(setData);
  }, []);

  const metrics = data?.metrics;

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-primary">Dashboard</h1>

      {!data?.success && data && (
        <p className="mt-4 text-destructive">Unable to load dashboard. Ensure you are logged in as admin.</p>
      )}

      {metrics && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Orders", value: metrics.totalOrders },
            { label: "Revenue (Paid)", value: formatPKR(metrics.revenue) },
            { label: "Pending Orders", value: metrics.pendingOrders },
            { label: "Awaiting Payment", value: metrics.awaitingPayment },
          ].map((m) => (
            <div key={m.label} className="rounded-2xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <p className="mt-1 font-display text-2xl font-bold">{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {data?.lowStock?.length > 0 && (
        <div className="mt-8 rounded-2xl border bg-card p-5">
          <h2 className="font-display font-bold text-destructive">Low Stock Alerts</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.lowStock.map((item, i) => (
              <li key={i}>{item.product} ({item.size}) — {item.stock} left (SKU: {item.sku})</li>
            ))}
          </ul>
        </div>
      )}

      {data?.recentOrders?.length > 0 && (
        <div className="mt-8 rounded-2xl border bg-card p-5">
          <h2 className="font-display font-bold">Recent Orders</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o._id} className="border-b">
                    <td className="py-2"><a href={`/admin/orders/${o._id}`} className="text-secondary hover:underline">{o.orderNumber}</a></td>
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
    </AdminLayout>
  );
}
