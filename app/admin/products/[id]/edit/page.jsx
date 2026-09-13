"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { AdminFormSkeleton, AdminPageHeaderSkeleton } from "@/components/admin/AdminSkeleton";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/products/${params.id}`).then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ])
      .then(([productData, catData]) => {
        if (productData.product) setForm(productData.product);
        setCategories(catData.categories || []);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const updateVariant = (index, field, value) => {
    const variants = [...form.variants];
    variants[index] = { ...variants[index], [field]: value };
    setForm({ ...form, variants });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`/api/admin/products/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nameEn: form.nameEn,
        nameUr: form.nameUr,
        shortDescriptionEn: form.shortDescriptionEn,
        descriptionEn: form.descriptionEn,
        featuredImage: form.featuredImage,
        images: form.images,
        categoryId: form.categoryId?._id || form.categoryId,
        variants: form.variants,
        isActive: form.isActive,
        featured: form.featured,
      }),
    });
    router.push("/admin/products");
  };

  if (loading || !form) {
    return (
      <AdminLayout>
        <AdminPageHeaderSkeleton />
        <AdminFormSkeleton fields={8} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-primary">Edit: {form.nameEn}</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Name (English)</label>
            <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="mt-1 w-full rounded-xl border px-4 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Name (Urdu)</label>
            <input value={form.nameUr} onChange={(e) => setForm({ ...form, nameUr: e.target.value })} className="mt-1 w-full rounded-xl border px-4 py-2 text-sm" dir="rtl" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Short Description</label>
          <textarea value={form.shortDescriptionEn || ""} onChange={(e) => setForm({ ...form, shortDescriptionEn: e.target.value })} className="mt-1 w-full rounded-xl border px-4 py-2 text-sm" rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            value={form.categoryId?._id || form.categoryId || ""}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="mt-1 w-full rounded-xl border px-4 py-2 text-sm"
          >
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.nameEn}</option>)}
          </select>
        </div>
        <ImageUpload
          label="Featured Image"
          value={form.featuredImage || ""}
          onChange={(url) => setForm({ ...form, featuredImage: url })}
          folder="noor-nursery/products"
        />
        <div>
          <label className="block text-sm font-medium">Additional Images (comma-separated URLs)</label>
          <input
            value={(form.images || []).join(", ")}
            onChange={(e) => setForm({ ...form, images: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            className="mt-1 w-full rounded-xl border px-4 py-2 text-sm"
          />
        </div>
        <div>
          <h3 className="font-semibold">Variants</h3>
          {form.variants?.map((v, i) => (
            <div key={v._id || v.size} className="mt-3 space-y-2 rounded-xl border p-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <input placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} className="rounded border px-2 py-1 text-sm" />
                <input type="number" placeholder="Price" value={v.price} onChange={(e) => updateVariant(i, "price", Number(e.target.value))} className="rounded border px-2 py-1 text-sm" />
                <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(i, "stock", Number(e.target.value))} className="rounded border px-2 py-1 text-sm" />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={v.isActive} onChange={(e) => updateVariant(i, "isActive", e.target.checked)} />
                  Active
                </label>
                <span className="self-center text-sm capitalize">{v.size}</span>
              </div>
              <ImageUpload
                label={`${v.sizeLabelEn} image (optional)`}
                value={v.image || ""}
                onChange={(url) => updateVariant(i, "image", url)}
                folder="noor-nursery/products/variants"
              />
            </div>
          ))}
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
