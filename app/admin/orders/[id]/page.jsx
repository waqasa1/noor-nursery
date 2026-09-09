"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { formatPKR } from "@/lib/utils/currency";

const ORDER_STATUSES = ["pending", "awaiting_payment", "payment_review", "paid", "processing", "packed", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["unpaid", "pending", "paid", "failed", "refunded"];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [updates, setUpdates] = useState({ orderStatus: "", paymentStatus: "", internalNote: "" });

  const load = () => fetch(`/api/admin/orders/${params.id}`).then((r) => r.json()).then((d) => {
    if (d.order) {
      setOrder(d.order);
      setUpdates({ orderStatus: d.order.orderStatus, paymentStatus: d.order.paymentStatus, internalNote: d.order.internalNote || "" });
    }
  });

  useEffect(() => { load(); }, [params.id]);

  const save = async () => {
    await fetch(`/api/admin/orders/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    load();
  };

  if (!order) return <AdminLayout><p>Loading...</p></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-primary">{order.orderNumber}</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">Customer</h2>
          <p className="mt-2">{order.customer.name}</p>
          <p>{order.customer.email}</p>
          <p>{order.customer.phone}</p>
          <h3 className="mt-4 font-semibold">Shipping</h3>
          <p className="text-sm">{order.shippingAddress?.addressLine1}</p>
          <p className="text-sm">{order.shippingAddress?.area}, {order.shippingAddress?.city}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">Update Status</h2>
          <div className="mt-3 space-y-3">
            <select value={updates.orderStatus} onChange={(e) => setUpdates({ ...updates, orderStatus: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm">
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={updates.paymentStatus} onChange={(e) => setUpdates({ ...updates, paymentStatus: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm">
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <textarea placeholder="Internal note" value={updates.internalNote} onChange={(e) => setUpdates({ ...updates, internalNote: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" rows={3} />
            <button type="button" onClick={save} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Save</button>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border bg-card p-5">
        <h2 className="font-semibold">Items — Total: {formatPKR(order.total)}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((item, i) => (
            <li key={i}>{item.nameEn} ({item.sizeLabelEn}) × {item.quantity} — {formatPKR(item.lineTotal)}</li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  );
}
