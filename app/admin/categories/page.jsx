"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminCategoriesSkeleton } from "@/components/admin/AdminSkeleton";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nameEn: "", nameUr: "", descriptionEn: "", image: "" });

  const load = () =>
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ nameEn: "", nameUr: "", descriptionEn: "", image: "" });
    load();
  };

  return (
    <AdminLayout>
      {loading ? (
        <AdminCategoriesSkeleton />
      ) : (
        <>
          <h1 className="font-display text-2xl font-bold text-primary">Categories</h1>
          <form onSubmit={handleCreate} className="mt-6 max-w-md space-y-3 rounded-2xl border bg-card p-4">
            <h2 className="font-semibold">Add Category</h2>
            <input placeholder="Name (English)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" required />
            <input placeholder="Name (Urdu)" value={form.nameUr} onChange={(e) => setForm({ ...form, nameUr: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" dir="rtl" required />
            <ImageUpload
              label="Category Image"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              folder="noor-nursery/categories"
            />
            <button type="submit" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Create</button>
          </form>
          {categories.length === 0 ? (
            <p className="mt-8 text-center text-muted-foreground">No categories yet.</p>
          ) : (
            <ul className="mt-6 space-y-2">
              {categories.map((c) => (
                <li key={c._id} className="flex justify-between rounded-xl border bg-card p-3">
                  <span>{c.nameEn} / <span dir="rtl" lang="ur">{c.nameUr}</span></span>
                  <span className="text-sm text-muted-foreground">{c.isActive ? "Active" : "Inactive"}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </AdminLayout>
  );
}
