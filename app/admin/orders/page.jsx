"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { formatPKR } from "@/lib/utils/currency";

const FILTERS = [
  { label: "All", orderStatus: "", paymentStatus: "" },
  { label: "Paid", orderStatus: "", paymentStatus: "paid" },
  { label: "Pending", orderStatus: "pending", paymentStatus: "" },
  { label: "Awaiting Payment", orderStatus: "awaiting_payment", paymentStatus: "" },
  { label: "Payment Review", orderStatus: "payment_review", paymentStatus: "" },
  { label: "Processing", orderStatus: "processing", paymentStatus: "" },
  { label: "Shipped", orderStatus: "shipped", paymentStatus: "" },
  { label: "Delivered", orderStatus: "delivered", paymentStatus: "" },
  { label: "Cancelled", orderStatus: "cancelled", paymentStatus: "" },
];

function filterKey(f) {
  if (f.paymentStatus) return `payment:${f.paymentStatus}`;
  if (f.orderStatus) return `order:${f.orderStatus}`;
  return "all";
}

function OrdersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const orderStatus = searchParams.get("orderStatus") || "";
  const paymentStatus = searchParams.get("paymentStatus") || "";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async (status, payStatus) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (status) params.set("orderStatus", status);
      if (payStatus) params.set("paymentStatus", payStatus);
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(orderStatus, paymentStatus);
  }, [orderStatus, paymentStatus, loadOrders]);

  const applyFilter = (filter) => {
    const params = new URLSearchParams();
    if (filter.orderStatus) params.set("orderStatus", filter.orderStatus);
    if (filter.paymentStatus) params.set("paymentStatus", filter.paymentStatus);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const active =
    FILTERS.find(
      (f) => f.orderStatus === orderStatus && f.paymentStatus === paymentStatus
    ) || FILTERS[0];

  const hasFilter = Boolean(orderStatus || paymentStatus);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilter ? `Showing: ${active.label}` : "All orders, newest first"}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const isActive =
            f.orderStatus === orderStatus && f.paymentStatus === paymentStatus;
          return (
            <button
              key={filterKey(f)}
              type="button"
              onClick={() => applyFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "border bg-card text-muted-foreground hover:border-secondary hover:text-secondary"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="mt-6">
          <AdminTableSkeleton columns={6} rows={8} />
        </div>
      ) : orders.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">
          No orders{hasFilter ? ` matching “${active.label}”` : " yet"}.
          {hasFilter ? (
            <>
              {" "}
              <button
                type="button"
                onClick={() => applyFilter(FILTERS[0])}
                className="font-semibold text-secondary hover:underline"
              >
                Clear filter
              </button>
            </>
          ) : null}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-surface-low text-left">
                <th className="p-3">Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{o.orderNumber}</td>
                  <td className="whitespace-nowrap text-muted-foreground">
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                    {o.createdAt ? (
                      <>
                        <br />
                        <span className="text-xs">
                          {new Date(o.createdAt).toLocaleTimeString("en-PK", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </>
                    ) : null}
                  </td>
                  <td>
                    {o.customer?.name}
                    <br />
                    <span className="text-muted-foreground">{o.customer?.email}</span>
                  </td>
                  <td>{formatPKR(o.total)}</td>
                  <td className="capitalize">
                    {o.paymentMethod.replace("_", " ")}
                    <br />
                    <span className="text-xs">{o.paymentStatus}</span>
                  </td>
                  <td className="capitalize">{o.orderStatus.replace("_", " ")}</td>
                  <td>
                    <Link href={`/admin/orders/${o._id}`} className="text-secondary hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <>
          <h1 className="font-display text-2xl font-bold text-primary">Orders</h1>
          <div className="mt-6">
            <AdminTableSkeleton columns={6} rows={8} />
          </div>
        </>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
