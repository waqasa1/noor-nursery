"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { Suspense, useEffect, useState } from "react";

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
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // any navigation (nav link, back button, redirect) closes the mobile drawer
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // still leave the admin area even if the request failed
    }
    router.push("/login?redirect=/admin");
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-low lg:flex-row">
      {/* Mobile top bar — sidebar collapses into a drawer below lg */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-forest/40 bg-primary px-4 py-3 text-primary-foreground lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-forest/70 transition hover:bg-forest"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link href="/admin" className="font-display text-lg font-bold">
          Noor Admin
        </Link>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col border-r bg-primary text-primary-foreground transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="hidden p-4 lg:block">
          <Link href="/admin" className="font-display text-lg font-bold">
            Noor Admin
          </Link>
        </div>
        <Suspense fallback={<div className="px-2 pb-4" />}>
          <SidebarNav />
        </Suspense>
        <div className="mt-auto flex flex-col gap-3 border-t border-forest p-4">
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
      <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
