"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { VariantEditor } from "@/components/admin/VariantEditor";
import { AdminFormSkeleton, AdminPageHeaderSkeleton } from "@/components/admin/AdminSkeleton";

const TEXT_FIELDS = [
  { id: "nameEn", label: "Name (English)", required: true },
  { id: "nameUr", label: "Name (Urdu)", required: true, urdu: true },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/products/${params.id}`).then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ])
      .then(([productData, catData]) => {
        if (productData.product) setForm(productData.product);
        else setError(productData.message || "Product not found");
        setCategories(catData.categories || []);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const grouped = useMemo(() => {
    const byType = { plant: [], accessory: [] };
    categories.forEach((c) => {
      const key = c.type === "accessory" ? "accessory" : "plant";
      byType[key].push(c);
    });
    return byType;
  }, [categories]);

  const categoryId = form?.categoryId?._id || form?.categoryId || "";
  const productType = form?.categoryId?.type === "accessory" ? "accessory" : "plant";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/admin/products/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nameEn: form.nameEn,
        nameUr: form.nameUr,
        shortDescriptionEn: form.shortDescriptionEn,
        descriptionEn: form.descriptionEn,
        featuredImage: form.featuredImage,
        images: form.images,
        categoryId,
        variants: form.variants,
        isActive: form.isActive,
        featured: form.featured,
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!data.success) {
      const fieldErrors = data.errors && Object.values(data.errors).flat();
      setError(fieldErrors?.[0] || data.message || "Failed to save");
      return;
    }
    router.push(productType === "accessory" ? "/admin/accessories" : "/admin/products");
  };

  if (loading || !form) {
    return (
      <AdminLayout>
        <AdminPageHeaderSkeleton />
        <AdminFormSkeleton fields={8} />
        {error && <p className="field-error mt-4">{error}</p>}
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Edit: {form.nameEn}</h1>
          <p className="text-sm text-muted-foreground">
            {productType === "accessory" ? "Accessory" : "Plant"} · /{form.slug}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push(productType === "accessory" ? "/admin/accessories" : "/admin/products")}
            className="rounded-full border-2 border-foreground/25 bg-white px-4 py-2 text-sm font-bold text-foreground transition hover:bg-surface-low"
          >
            Back to list
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-5">
        <section className="field-card space-y-4">
          <h2 className="field-label-normal">Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {TEXT_FIELDS.map((f) => (
              <div key={f.id}>
                <label className="field-label" htmlFor={f.id}>
                  {f.label}
                  {f.required && " *"}
                </label>
                <input
                  id={f.id}
                  className="field-input"
                  dir={f.urdu ? "rtl" : "ltr"}
                  lang={f.urdu ? "ur" : "en"}
                  value={form[f.id] || ""}
                  onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
                  required={f.required}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="shortDescriptionEn">Short Description</label>
              <textarea
                id="shortDescriptionEn"
                className="field-textarea"
                rows={2}
                value={form.shortDescriptionEn || ""}
                onChange={(e) => setForm({ ...form, shortDescriptionEn: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="descriptionEn">Full Description</label>
              <textarea
                id="descriptionEn"
                className="field-textarea"
                rows={4}
                value={form.descriptionEn || ""}
                onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
              />
            </div>
          </div>
        </section>

        <section className="field-card">
          <h2 className="field-label-normal">Category &amp; picture</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="categoryId">Category</label>
              <select
                id="categoryId"
                className="field-select"
                value={categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">Select category</option>
                {grouped.plant.length > 0 && (
                  <optgroup label="Plant categories">
                    {grouped.plant.map((c) => (
                      <option key={c._id} value={c._id}>{c.nameEn}</option>
                    ))}
                  </optgroup>
                )}
                {grouped.accessory.length > 0 && (
                  <optgroup label="Accessory categories">
                    {grouped.accessory.map((c) => (
                      <option key={c._id} value={c._id}>{c.nameEn}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            <div>
              <ImageUpload
                label="Featured picture"
                value={form.featuredImage || ""}
                onChange={(url) => setForm({ ...form, featuredImage: url })}
                folder="noor-nursery/products"
              />
            </div>
          </div>
        </section>

        <VariantEditor
          variants={form.variants || []}
          onChange={(variants) => setForm({ ...form, variants })}
        />

        <section className="field-card flex flex-wrap gap-4">
          <label className="field-check">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active / Published
          </label>
          <label className="field-check">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Featured on homepage
          </label>
        </section>

        {error && <p className="field-error">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-primary px-8 py-3 font-bold text-primary-foreground transition hover:bg-forest disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </AdminLayout>
  );
}
