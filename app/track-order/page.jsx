"use client";

import { useState } from "react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { formatPKR } from "@/lib/utils/currency";
import { IMAGES } from "@/components/nursery/data";
import { Leaf, Package, Search } from "lucide-react";

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
      <div className="flex min-h-[calc(100vh-140px)] flex-col lg:flex-row">
        {/* Left Side: Image */}
        <div className="relative hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:bg-primary lg:p-12">
          <div className="absolute inset-0 z-0 opacity-40">
            <img src={IMAGES.indoor} alt="Plants background" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-primary/70 mix-blend-multiply"></div>
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-leaf text-leaf-foreground">
              <Leaf className="h-6 w-6" />
            </div>
            <span className="font-display text-xl font-bold text-primary-foreground tracking-tight">NOOR NURSERY</span>
          </div>
          <div className="relative z-10 mt-auto max-w-md">
            <h2 className="font-display text-4xl font-bold leading-tight text-primary-foreground">
              Where are my plants?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Track your shipment in real-time. We ensure safe, shock-proof delivery across Pakistan.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex flex-1 items-center justify-center p-6 lg:w-1/2 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-10 text-center lg:text-left">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary lg:mx-0">
                <Search className="h-8 w-8" />
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-primary lg:text-4xl">Track Your Order</h1>
              <p className="text-urdu mt-2 text-lg text-secondary" dir="rtl" lang="ur">اپنا آرڈر ٹریک کریں</p>
              <p className="mt-2 text-sm text-muted-foreground">Enter your order number and email to see the current status.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-foreground">Order Number</label>
                <input 
                  id="orderNumber" 
                  required 
                  value={form.orderNumber} 
                  onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} 
                  className="mt-2 w-full rounded-2xl border bg-surface-low px-4 py-3 text-sm outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary" 
                  placeholder="e.g. NN-250909-ABC123" 
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">Email Address</label>
                <input 
                  id="email" 
                  type="email" 
                  required 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  className="mt-2 w-full rounded-2xl border bg-surface-low px-4 py-3 text-sm outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary" 
                  placeholder="you@example.com"
                />
              </div>
              {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
              <button 
                type="submit" 
                disabled={loading} 
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-bold text-primary-foreground transition hover:bg-forest disabled:opacity-70"
              >
                {loading ? "Searching..." : <><Search className="h-4 w-4" /> Track Order</>}
              </button>
            </form>

            {order && (
              <div className="mt-10 overflow-hidden rounded-3xl border bg-card shadow-sm">
                <div className="bg-surface-low p-6">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-secondary" />
                    <h3 className="font-display text-lg font-bold text-foreground">{order.orderNumber}</h3>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold capitalize text-primary">
                      Status: {order.orderStatus.replace("_", " ")}
                    </span>
                    <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold capitalize text-secondary">
                      Payment: {order.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between border-b pb-4">
                    <span className="font-semibold text-foreground">Total Amount</span>
                    <span className="font-bold text-primary">{formatPKR(order.total)}</span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Items</h4>
                    <ul className="space-y-3">
                      {order.items?.map((item, i) => (
                        <li key={i} className="flex justify-between text-sm">
                          <div>
                            <span className="font-medium text-foreground">{item.nameEn}</span>
                            <span className="text-muted-foreground"> × {item.quantity}</span>
                          </div>
                          <span className="text-muted-foreground">{item.sizeLabelEn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
