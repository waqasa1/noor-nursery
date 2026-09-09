"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { formatPKR } from "@/lib/utils/currency";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (!d.success) router.push("/login?redirect=/account/orders");
    });
    // Orders fetched via account API would go here; for now show track link
  }, [router]);

  return (
    <StoreLayout showFlashDeal={false}>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link href="/account" className="text-sm text-secondary hover:underline">← Account</Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-primary">My Orders</h1>
        <p className="mt-4 text-muted-foreground">
          Track your orders using your order number and email on the{" "}
          <Link href="/track-order" className="font-semibold text-secondary hover:underline">Track Order</Link> page.
        </p>
      </div>
    </StoreLayout>
  );
}
