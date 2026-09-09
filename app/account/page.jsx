"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Leaf, Package, User as UserIcon, Settings, LogOut, ChevronRight } from "lucide-react";

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

  if (!user) return (
    <StoreLayout showFlashDeal={false}>
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground font-medium">Loading your account...</p>
        </div>
      </div>
    </StoreLayout>
  );

  return (
    <StoreLayout showFlashDeal={false}>
      <div className="mx-auto max-w-5xl px-4 py-12 lg:py-20">
        
        {/* Welcome Section */}
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-primary p-8 text-primary-foreground sm:flex-row sm:p-12">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-leaf text-leaf-foreground shadow-md">
              <UserIcon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-foreground/80">Welcome back,</p>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{user.name}</h1>
            </div>
          </div>
          <button 
            type="button" 
            onClick={logout} 
            className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-foreground/20"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </div>

        {/* Quick Links Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: "/account/orders", title: "My Orders", desc: "Track, return, or view past purchases", icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
            { href: "/account/profile", title: "Profile Settings", desc: "Manage your details and password", icon: Settings, color: "text-purple-500", bg: "bg-purple-50" },
            ...(user.role === "admin" ? [{ href: "/admin", title: "Admin Dashboard", desc: "Manage store and inventory", icon: Leaf, color: "text-green-600", bg: "bg-green-50" }] : []),
          ].map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="group flex flex-col justify-between rounded-3xl border bg-card p-6 transition-all hover:border-secondary hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-low text-muted-foreground transition group-hover:bg-secondary group-hover:text-secondary-foreground">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-8">
                <h2 className="font-display text-xl font-bold text-foreground">{item.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </StoreLayout>
  );
}
