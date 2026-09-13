"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";

const DEFAULT_VARIANTS = [
  { size: "small", sizeLabelEn: 'Small 6"', sizeLabelUr: "چھوٹا", sku: "", price: 0, stock: 10, isActive: true, image: "" },
  { size: "medium", sizeLabelEn: 'Medium 14"', sizeLabelUr: "درمیانہ", sku: "", price: 0, stock: 10, isActive: true, image: "" },
  { size: "large", sizeLabelEn: "Large 3ft", sizeLabelUr: "بڑا", sku: "", price: 0, stock: 10, isActive: true, image: "" },
];

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    nameEn: "", nameUr: "", categoryId: "", shortDescriptionEn: "", descriptionEn: "",
    featuredImage: "", images: [], variants: DEFAULT_VARIANTS, featured: false, isActive: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  const updateVariant = (index, field, value) => {
    const variants = [...form.variants];
    variants[index] = { ...variants[index], [field]: value };
    setForm({ ...form, variants });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.message || "Failed to create product");
      return;
    }
    router.push("/admin/products");
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-primary">New Product</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4">
        {[
          { id: "nameEn", label: "Name (English)" },
          { id: "nameUr", label: "Name (Urdu)" },
          { id: "shortDescriptionEn", label: "Short Description" },
          { id: "descriptionEn", label: "Full Description" },
        ].map((f) => (
          <div key={f.id}>
            <label className="block text-sm font-medium">{f.label}</label>
            <input value={form[f.id]} onChange={(e) => setForm({ ...form, [f.id]: e.target.value })} className="mt-1 w-full rounded-xl border px-4 py-2 text-sm" required={["nameEn", "nameUr"].includes(f.id)} />
          </div>
        ))}
        <ImageUpload
          label="Featured Image"
          value={form.featuredImage}
          onChange={(url) => setForm({ ...form, featuredImage: url })}
          folder="noor-nursery/products"
        />
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="mt-1 w-full rounded-xl border px-4 py-2 text-sm" required>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.nameEn}</option>)}
          </select>
        </div>
        <div>
          <h3 className="font-semibold">Variants</h3>
          {form.variants.map((v, i) => (
            <div key={v.size} className="mt-3 space-y-2 rounded-xl border p-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <input placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} className="rounded border px-2 py-1 text-sm" required />
                <input type="number" placeholder="Price" value={v.price} onChange={(e) => updateVariant(i, "price", Number(e.target.value))} className="rounded border px-2 py-1 text-sm" required />
                <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(i, "stock", Number(e.target.value))} className="rounded border px-2 py-1 text-sm" required />
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
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button type="submit" className="rounded-full bg-primary px-6 py-2.5 font-bold text-primary-foreground">Create Product</button>
      </form>
    </AdminLayout>
  );
}
