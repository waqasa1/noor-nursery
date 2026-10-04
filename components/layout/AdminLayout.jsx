"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogOut } from "lucide-react";
import { Suspense } from "react";

const NAV_GROUPS = [
  {
    items: [{ href: "/admin", label: "Dashboard", exact: true }],
  },
  {
    title: "Plants",
    items: [
      { href: "/admin/products", label: "All Plants" },
      { href: "/admin/categories", label: "Plant Categories" },
    ],
  },
  {
    title: "Accessories",
    items: [
      { href: "/admin/accessories", label: "All Accessories" },
      { href: "/admin/accessories/categories", label: "Accessory Categories" },
    ],
  },
  {
    title: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/customers", label: "Customers" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/settings", label: "Settings" },
      { href: "/admin/account", label: "Account" },
    ],
  },
];

function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    if (item.href === "/admin/products" || item.href === "/admin/accessories") {
      // keep "All Plants" lit while editing a product
      return current === item.href || pathname.startsWith("/admin/products/");
    }
    if (item.href === "/admin/accessories/categories") return current === item.href;
    if (item.href === "/admin/categories") return current === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <nav className="px-2 pb-4" aria-label="Admin navigation">
      {NAV_GROUPS.map((group, gi) => (
        <div key={group.title || `group-${gi}`}>
          {group.title && (
            <p className="mt-4 px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-leaf/70">
              {group.title}
            </p>
          )}
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive(item)
                  ? "bg-forest font-semibold text-leaf"
                  : "text-primary-foreground/85 hover:bg-forest/60 hover:text-leaf"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

export function AdminLayout({ children }) {
  const router = useRouter();

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // still leave the admin area even if the request failed
    }
    router.push("/login?redirect=/admin");
  };

  return (
    <div className="flex min-h-screen bg-surface-low">
      <aside className="w-60 shrink-0 border-r bg-primary text-primary-foreground">
        <div className="p-4">
          <Link href="/admin" className="font-display text-lg font-bold">
            Noor Admin
          </Link>
        </div>
        <Suspense fallback={<div className="px-2 pb-4" />}>
          <SidebarNav />
        </Suspense>
        <div className="flex flex-col gap-3 border-t border-forest p-4">
          <Link href="/" className="text-sm hover:text-leaf">
            ← Back to Store
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center justify-center gap-2 rounded-lg bg-forest px-3 py-2 text-sm font-semibold text-leaf transition hover:bg-forest/70"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
