"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminPageHeaderSkeleton, AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { formatPKR } from "@/lib/utils/currency";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      {loading ? (
        <>
          <AdminPageHeaderSkeleton />
          <AdminTableSkeleton columns={6} rows={8} />
        </>
      ) : (
        <>
          <h1 className="font-display text-2xl font-bold text-primary">Orders</h1>
          {orders.length === 0 ? (
            <p className="mt-8 text-center text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-surface-low text-left">
                    <th className="p-3">Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id} className="border-b">
                      <td className="p-3 font-medium">{o.orderNumber}</td>
                      <td>{o.customer?.name}<br /><span className="text-muted-foreground">{o.customer?.email}</span></td>
                      <td>{formatPKR(o.total)}</td>
                      <td className="capitalize">{o.paymentMethod.replace("_", " ")}<br /><span className="text-xs">{o.paymentStatus}</span></td>
                      <td className="capitalize">{o.orderStatus.replace("_", " ")}</td>
                      <td><Link href={`/admin/orders/${o._id}`} className="text-secondary hover:underline">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
