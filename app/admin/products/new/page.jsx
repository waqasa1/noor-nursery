"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { VariantEditor, EMPTY_VARIANT } from "@/components/admin/VariantEditor";

const TEXT_FIELDS = [
  { id: "nameEn", label: "Name (English)", placeholder: "e.g. Mango Hybrid Sindri", required: true },
  { id: "nameUr", label: "Name (Urdu)", placeholder: "مثلاً آم سندھڑی", required: true, urdu: true },
  { id: "shortDescriptionEn", label: "Short Description", placeholder: "One line shown on the product card" },
  { id: "descriptionEn", label: "Full Description", placeholder: "Everything a buyer needs to know", textarea: true },
];

export default function NewProductPage() {
  const router = useRouter();
  const [type, setType] = useState("plant");
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    nameEn: "",
    nameUr: "",
    categoryId: "",
    shortDescriptionEn: "",
    descriptionEn: "",
    featuredImage: "",
    images: [],
    variants: [
      { ...EMPTY_VARIANT, size: "small", sizeLabelEn: "Small" },
      { ...EMPTY_VARIANT, size: "medium", sizeLabelEn: "Medium" },
      { ...EMPTY_VARIANT, size: "large", sizeLabelEn: "Large" },
    ],
    featured: false,
    isActive: true,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("type");
    if (wanted === "accessory" || wanted === "plant") setType(wanted);
  }, []);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  const grouped = useMemo(() => {
    const byType = { plant: [], accessory: [] };
    categories.forEach((c) => {
      const key = c.type === "accessory" ? "accessory" : "plant";
      byType[key].push(c);
    });
    return byType;
  }, [categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (!data.success) {
      const fieldErrors = data.errors && Object.values(data.errors).flat();
      setError(fieldErrors?.[0] || data.message || "Failed to create product");
      return;
    }
    router.push(type === "accessory" ? "/admin/accessories" : "/admin/products");
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">
            New {type === "accessory" ? "Accessory" : "Plant"}
          </h1>
          <p className="text-sm text-muted-foreground">
            It will appear under{" "}
            <span className="font-semibold text-foreground">
              {type === "accessory" ? "All Accessories" : "All Plants"}
            </span>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border-2 border-foreground/25 bg-white px-4 py-2 text-sm font-bold text-foreground transition hover:bg-surface-low"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-5">
        <section className="field-card space-y-4">
          <h2 className="field-label-normal">Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {TEXT_FIELDS.map((f) => (
              <div key={f.id} className={f.textarea ? "sm:col-span-2" : ""}>
                <label className="field-label" htmlFor={f.id}>
                  {f.label}
                  {f.required && " *"}
                </label>
                {f.textarea ? (
                  <textarea
                    id={f.id}
                    className="field-textarea"
                    rows={3}
                    placeholder={f.placeholder}
                    value={form[f.id]}
                    onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
                    required={f.required}
                  />
                ) : (
                  <input
                    id={f.id}
                    className="field-input"
                    dir={f.urdu ? "rtl" : "ltr"}
                    lang={f.urdu ? "ur" : "en"}
                    placeholder={f.placeholder}
                    value={form[f.id]}
                    onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
                    required={f.required}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="field-card">
          <h2 className="field-label-normal">Category &amp; picture</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="categoryId">Category *</label>
              <select
                id="categoryId"
                className="field-select"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
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
                value={form.featuredImage}
                onChange={(url) => setForm({ ...form, featuredImage: url })}
                folder="noor-nursery/products"
              />
            </div>
          </div>
        </section>

        <VariantEditor
          variants={form.variants}
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
          {saving ? "Creating…" : `Create ${type === "accessory" ? "Accessory" : "Plant"}`}
        </button>
      </form>
    </AdminLayout>
  );
}
