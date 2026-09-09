"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ nameEn: "", nameUr: "", descriptionEn: "", image: "" });

  const load = () => fetch("/api/admin/categories").then((r) => r.json()).then((d) => setCategories(d.categories || []));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ nameEn: "", nameUr: "", descriptionEn: "", image: "" });
    load();
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-primary">Categories</h1>
      <form onSubmit={handleCreate} className="mt-6 max-w-md space-y-3 rounded-2xl border bg-card p-4">
        <h2 className="font-semibold">Add Category</h2>
        <input placeholder="Name (English)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" required />
        <input placeholder="Name (Urdu)" value={form.nameUr} onChange={(e) => setForm({ ...form, nameUr: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" dir="rtl" required />
        <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" />
        <button type="submit" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Create</button>
      </form>
      <ul className="mt-6 space-y-2">
        {categories.map((c) => (
          <li key={c._id} className="rounded-xl border bg-card p-3 flex justify-between">
            <span>{c.nameEn} / <span dir="rtl" lang="ur">{c.nameUr}</span></span>
            <span className="text-sm text-muted-foreground">{c.isActive ? "Active" : "Inactive"}</span>
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
}
