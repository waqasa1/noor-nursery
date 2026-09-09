"use client";

import { useState } from "react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { formatPKR } from "@/lib/utils/currency";

export default function TrackOrderPage() {
  const [form, setForm] = useState({ orderNumber: "", email: "" });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    const res = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!data.success) {
      setError(data.message);
      return;
    }
    setOrder(data.order);
  };

  return (
    <StoreLayout showFlashDeal={false}>
      <div className="mx-auto max-w-lg px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-primary">Track Your Order</h1>
        <p className="text-urdu mt-1 text-secondary" dir="rtl" lang="ur">اپna آرڈر ٹریک کریں</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border bg-card p-6">
          <div>
            <label htmlFor="orderNumber" className="block text-sm font-medium">Order Number</label>
            <input id="orderNumber" required value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm" placeholder="NN-250909-ABC123" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm" />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-primary py-3 font-bold text-primary-foreground">
            {loading ? "Searching..." : "Track Order"}
          </button>
        </form>

        {order && (
          <div className="mt-8 rounded-2xl border bg-card p-6">
            <p className="font-bold text-lg">{order.orderNumber}</p>
            <p className="mt-2 capitalize">Status: {order.orderStatus.replace("_", " ")}</p>
            <p className="capitalize">Payment: {order.paymentStatus}</p>
            <p className="mt-2">Total: {formatPKR(order.total)}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {order.items?.map((item, i) => (
                <li key={i}>{item.nameEn} × {item.quantity} — {item.sizeLabelEn}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
