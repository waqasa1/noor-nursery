"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminOrderDetailSkeleton } from "@/components/admin/AdminSkeleton";
import { formatPKR } from "@/lib/utils/currency";

const ORDER_STATUSES = ["pending", "awaiting_payment", "payment_review", "paid", "processing", "packed", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["unpaid", "pending", "paid", "failed", "refunded"];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState({
    orderStatus: "",
    paymentStatus: "",
    paymentReference: "",
    internalNote: "",
  });

  const load = () =>
    fetch(`/api/admin/orders/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.order) {
          setOrder(d.order);
          setUpdates({
            orderStatus: d.order.orderStatus,
            paymentStatus: d.order.paymentStatus,
            paymentReference: d.order.paymentReference || "",
            internalNote: d.order.internalNote || "",
          });
        }
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    setLoading(true);
    load();
  }, [params.id]);

  const save = async () => {
    await fetch(`/api/admin/orders/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    load();
  };

  if (loading || !order) {
    return (
      <AdminLayout>
        <AdminOrderDetailSkeleton />
      </AdminLayout>
    );
  }

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
            <button
              type="button"
              onClick={async () => {
                await fetch(`/api/admin/orders/${params.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ resendEmail: true }),
                });
                alert("Status email sent");
              }}
              className="block w-full rounded-full border px-4 py-2 text-sm font-bold"
            >
              Resend Status Email
            </button>
            <button
              type="button"
              onClick={async () => {
                await fetch(`/api/admin/orders/${params.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ resendConfirmation: true }),
                });
                alert("Confirmation email sent");
              }}
              className="block w-full rounded-full border px-4 py-2 text-sm font-bold"
            >
              Resend Confirmation Email
            </button>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">Payment</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                order.paymentStatus === "paid"
                  ? "bg-leaf/25 text-leaf-foreground"
                  : "bg-gold/25 text-gold-foreground"
              }`}
            >
              {order.paymentMethod.replace("_", " ")} · {order.paymentStatus}
            </span>
          </div>

          {order.paymentMethod === "easypaisa" && (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border bg-surface-low p-4 text-sm">
                <p className="font-semibold text-foreground">
                  Verify in your own EasyPaisa app before shipping
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>Amount expected: <span className="font-bold text-foreground">{formatPKR(order.total)}</span></li>
                  <li>
                    TrxID submitted by customer:{" "}
                    <span className="font-mono font-bold text-foreground">
                      {updates.paymentReference || "— not submitted —"}
                    </span>
                  </li>
                  {order.paymentGatewayResponse?.submittedAt && (
                    <li>
                      Submitted {new Date(order.paymentGatewayResponse.submittedAt).toLocaleString()}
                      {order.paymentGatewayResponse.reusedTrxId ? " · ⚠ TrxID reused on another order" : ""}
                    </li>
                  )}
                  <li>
                    Search that TrxID / amount in your EasyPaisa transaction history — trust your own wallet,
                    never a screenshot.
                  </li>
                </ul>
              </div>

              <label className="block text-sm font-medium text-foreground">
                Transaction ID (TrxID)
                <input
                  value={updates.paymentReference}
                  onChange={(e) => setUpdates({ ...updates, paymentReference: e.target.value.toUpperCase() })}
                  placeholder="Paste or type the TrxID you verified"
                  className="field-input mt-2 w-full"
                />
              </label>

              {order.paymentStatus !== "paid" ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm(`Confirm you received ${formatPKR(order.total)} in your EasyPaisa account for ${order.orderNumber}. The customer will be emailed "Payment received" and the order cannot be cancelled.`)) return;
                      await fetch(`/api/admin/orders/${params.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentStatus: "paid", paymentReference: updates.paymentReference }),
                      });
                      load();
                    }}
                    className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
                  >
                    Mark Payment Received
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    className="rounded-full border px-5 py-2.5 text-sm font-bold"
                  >
                    Save TrxID Only
                  </button>
                </div>
              ) : (
                <p className="rounded-xl bg-leaf/15 p-3 text-sm font-semibold text-leaf-foreground">
                  ✓ Payment verified — customer has been notified.
                </p>
              )}
            </div>
          )}

          {order.paymentMethod !== "easypaisa" && (
            <p className="mt-3 text-sm text-muted-foreground">
              Current status: <span className="font-semibold text-foreground">{order.paymentStatus}</span>
              {order.paymentReference ? ` · reference ${order.paymentReference}` : ""}
            </p>
          )}
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
