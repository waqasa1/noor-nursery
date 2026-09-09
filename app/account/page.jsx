"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreLayout } from "@/components/layout/StoreLayout";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) router.push("/login?redirect=/account");
        else setUser(data.user);
      });
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (!user) return <StoreLayout showFlashDeal={false}><div className="p-14 text-center">Loading...</div></StoreLayout>;

  return (
    <StoreLayout showFlashDeal={false}>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-primary">My Account</h1>
        <p className="mt-2 text-muted-foreground">Welcome, {user.name}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            { href: "/account/orders", title: "My Orders", desc: "View order history" },
            { href: "/account/profile", title: "Profile", desc: "Update your details" },
            ...(user.role === "admin" ? [{ href: "/admin", title: "Admin Dashboard", desc: "Manage store" }] : []),
          ].map((item) => (
            <Link key={item.href} href={item.href} className="rounded-2xl border bg-card p-6 transition hover:border-secondary hover:shadow-md">
              <h2 className="font-display font-bold text-foreground">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
            </Link>
          ))}
        </div>

        <button type="button" onClick={logout} className="mt-8 rounded-full border px-6 py-2.5 text-sm font-semibold hover:bg-surface-low">
          Log Out
        </button>
      </div>
    </StoreLayout>
  );
}
