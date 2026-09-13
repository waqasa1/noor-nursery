"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminPageHeaderSkeleton, AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { formatPKR } from "@/lib/utils/currency";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      {loading ? (
        <>
          <AdminPageHeaderSkeleton action />
          <AdminTableSkeleton columns={6} rows={8} />
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-primary">Products</h1>
            <Link href="/admin/products/new" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Add Product</Link>
          </div>

          {products.length === 0 ? (
            <p className="mt-8 text-center text-muted-foreground">No products yet. Add your first product.</p>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-surface-low text-left">
                    <th className="p-3">Name</th>
                    <th>Category</th>
                    <th>Price From</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const stock = p.variants?.reduce((s, v) => s + (v.stock || 0), 0) || 0;
                    const price = p.variants?.length ? Math.min(...p.variants.map((v) => v.price)) : 0;
                    return (
                      <tr key={p._id} className="border-b">
                        <td className="p-3 font-medium">{p.nameEn}</td>
                        <td>{p.categoryId?.nameEn || "—"}</td>
                        <td>{formatPKR(price)}</td>
                        <td>{stock}</td>
                        <td>{p.isActive ? "Active" : "Archived"}</td>
                        <td><Link href={`/admin/products/${p._id}/edit`} className="text-secondary hover:underline">Edit</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
