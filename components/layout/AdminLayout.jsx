"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/account", label: "Account" },
];

export function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-surface-low">
      <aside className="w-56 shrink-0 border-r bg-primary text-primary-foreground">
        <div className="p-4">
          <Link href="/admin" className="font-display text-lg font-bold">Noor Admin</Link>
        </div>
        <nav className="px-2 pb-4" aria-label="Admin navigation">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                  ? "bg-forest text-leaf"
                  : "hover:bg-forest/60"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-forest p-4">
          <Link href="/" className="text-sm hover:text-leaf">← Back to Store</Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
