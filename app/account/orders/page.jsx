"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { formatPKR } from "@/lib/utils/currency";

function statusColor(status) {
  if (["delivered", "paid"].includes(status)) return "text-leaf";
  if (["cancelled", "failed", "refunded"].includes(status)) return "text-destructive";
  return "text-secondary";
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account/orders")
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) {
          router.push("/login?redirect=/account/orders");
          return;
        }
        setOrders(d.orders || []);
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <StoreLayout showFlashDeal={false}>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link href="/account" className="text-sm text-secondary hover:underline">← Account</Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-primary">My Orders</h1>

        {loading ? (
          <p className="mt-8 text-muted-foreground">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border bg-card p-8 text-center">
            <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
            <Link href="/shop" className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">
              Start Shopping
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {orders.map((order) => (
              <li key={order.orderNumber} className="rounded-2xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display font-bold text-primary">{order.orderNumber}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{formatPKR(order.total)}</p>
                    <p className={`mt-1 text-sm font-medium capitalize ${statusColor(order.orderStatus)}`}>
                      {order.orderStatus.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <li key={i}>{item.nameEn} × {item.quantity}</li>
                  ))}
                  {order.items?.length > 3 && (
                    <li>+ {order.items.length - 3} more items</li>
                  )}
                </ul>
                <Link
                  href={`/track-order?order=${order.orderNumber}`}
                  className="mt-4 inline-block text-sm font-semibold text-secondary hover:underline"
                >
                  Track this order →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </StoreLayout>
  );
}
