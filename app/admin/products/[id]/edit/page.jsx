"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`).then((r) => r.json()).then((d) => {
      if (d.product) setForm(d.product);
    });
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`/api/admin/products/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/admin/products");
  };

  if (!form) return <AdminLayout><p>Loading...</p></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-primary">Edit: {form.nameEn}</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium">Name (English)</label>
          <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="mt-1 w-full rounded-xl border px-4 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Name (Urdu)</label>
          <input value={form.nameUr} onChange={(e) => setForm({ ...form, nameUr: e.target.value })} className="mt-1 w-full rounded-xl border px-4 py-2 text-sm" dir="rtl" />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Active / Published
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          Featured
        </label>
        <button type="submit" className="rounded-full bg-primary px-6 py-2.5 font-bold text-primary-foreground">Save Changes</button>
      </form>
    </AdminLayout>
  );
}
