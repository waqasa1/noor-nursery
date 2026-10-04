"use client";

import { useEffect, useMemo, useState } from "react";
import { FolderPlus, Loader2, Pencil, Search, Trash2, X } from "lucide-react";
import { AdminCategoriesSkeleton } from "@/components/admin/AdminSkeleton";
import { ImageUpload } from "@/components/admin/ImageUpload";

const EMPTY = {
  nameEn: "",
  nameUr: "",
  slug: "",
  descriptionEn: "",
  descriptionUr: "",
  image: "",
  sortOrder: 0,
  isActive: true,
};

export function CategoryManager({ type, title, description }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(null); // null = closed
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isEdit = !!form?._id;

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/categories?type=${type}`)
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [type]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.nameEn.toLowerCase().includes(q) ||
        c.nameUr.includes(query.trim()) ||
        c.slug.includes(q)
    );
  }, [categories, query]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = { ...form, type };
    const res = await fetch(
      isEdit ? `/api/admin/categories/${form._id}` : "/api/admin/categories",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();

    setSaving(false);
    if (!data.success) {
      const fieldErrors = data.errors && Object.values(data.errors).flat();
      setError(fieldErrors?.[0] || data.message || "Something went wrong");
      return;
    }

    setForm(null);
    setNotice(isEdit ? `Updated "${payload.nameEn}"` : `Created "${payload.nameEn}"`);
    load();
  };

  const remove = async (category) => {
    if (
      !window.confirm(
        `Delete "${category.nameEn}"? This cannot be undone.`
      )
    )
      return;

    const res = await fetch(`/api/admin/categories/${category._id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) {
      window.alert(data.message || "Could not delete category");
      return;
    }
    setNotice(`Deleted "${category.nameEn}"`);
    load();
  };

  if (loading) return <AdminCategoriesSkeleton />;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border-2 border-foreground/25 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-foreground/60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories…"
              aria-label="Search categories"
              className="w-40 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-foreground/50"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setForm({ ...EMPTY, type });
              setError("");
            }}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-forest"
          >
            <FolderPlus className="h-4 w-4" /> Add Category
          </button>
        </div>
      </div>

      {notice && (
        <p className="mt-4 rounded-xl border-2 border-secondary/40 bg-white px-4 py-2.5 text-sm font-semibold text-foreground">
          {notice}
        </p>
      )}

      {form && (
        <form onSubmit={submit} className="mt-6 rounded-2xl border-2 border-secondary/40 bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">
              {isEdit ? `Edit: ${form.nameEn}` : `New ${type === "accessory" ? "Accessory" : "Plant"} Category`}
            </h2>
            <button
              type="button"
              onClick={() => setForm(null)}
              aria-label="Close form"
              className="rounded-full border-2 border-foreground/20 bg-white p-1.5 text-foreground transition hover:bg-surface-low"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="cat-name-en">Name (English) *</label>
              <input
                id="cat-name-en"
                className="field-input"
                value={form.nameEn}
                onChange={(e) => set("nameEn", e.target.value)}
                placeholder="e.g. Pots and Planters"
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="cat-name-ur">Name (Urdu) *</label>
              <input
                id="cat-name-ur"
                className="field-input"
                dir="rtl"
                lang="ur"
                value={form.nameUr}
                onChange={(e) => set("nameUr", e.target.value)}
                placeholder="متبادل نام"
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="cat-slug">Slug</label>
              <input
                id="cat-slug"
                className="field-input"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="auto-generated from the English name"
              />
              <p className="field-hint">Used in URLs: /shop?category=… — keep it stable once published.</p>
            </div>
            <div>
              <label className="field-label" htmlFor="cat-sort">Sort order</label>
              <input
                id="cat-sort"
                type="number"
                className="field-input"
                value={form.sortOrder ?? 0}
                onChange={(e) => set("sortOrder", Number(e.target.value))}
              />
              <p className="field-hint">Lower numbers appear first.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="cat-desc-en">Description (English)</label>
              <textarea
                id="cat-desc-en"
                className="field-textarea"
                rows={2}
                value={form.descriptionEn}
                onChange={(e) => set("descriptionEn", e.target.value)}
                placeholder="Shown on the category page"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="cat-desc-ur">Description (Urdu)</label>
              <textarea
                id="cat-desc-ur"
                className="field-textarea"
                rows={2}
                dir="rtl"
                lang="ur"
                value={form.descriptionUr}
                onChange={(e) => set("descriptionUr", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <ImageUpload
              label="Category picture (shown on the storefront)"
              value={form.image || ""}
              onChange={(url) => set("image", url)}
              folder="noor-nursery/categories"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="field-check">
              <input
                type="checkbox"
                checked={form.isActive !== false}
                onChange={(e) => set("isActive", e.target.checked)}
              />
              Active (visible in store)
            </label>
          </div>

          {error && <p className="field-error mt-3">{error}</p>}

          <div className="mt-5 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-forest disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Category"}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="rounded-full border-2 border-foreground/25 bg-white px-6 py-2.5 text-sm font-bold text-foreground transition hover:bg-surface-low"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-2xl border bg-card p-10 text-center text-muted-foreground">
          {categories.length === 0 ? "No categories yet — add your first one." : "No categories match that search."}
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <li key={c._id} className="flex flex-col rounded-2xl border-2 border-foreground/15 bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-foreground/10 bg-surface-low">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-[10px] font-bold uppercase text-muted-foreground">
                      No img
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-foreground">{c.nameEn}</p>
                  <p className="text-urdu truncate text-sm text-secondary" dir="rtl" lang="ur">
                    {c.nameUr}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">/{c.slug}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-foreground/10 pt-3">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="rounded-full bg-surface-low px-2 py-1 text-foreground">
                    {c.productCount || 0} products
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 uppercase ${
                      c.isActive !== false
                        ? "bg-secondary/15 text-secondary"
                        : "bg-foreground/10 text-muted-foreground"
                    }`}
                  >
                    {c.isActive !== false ? "Active" : "Hidden"}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setNotice("");
                      setForm({ ...EMPTY, ...c, slug: c.slug || "" });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex items-center gap-1 rounded-lg border-2 border-secondary/40 bg-white px-2.5 py-1.5 text-xs font-bold text-secondary transition hover:bg-secondary hover:text-secondary-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c)}
                    className="flex items-center gap-1 rounded-lg border-2 border-destructive/40 bg-white px-2.5 py-1.5 text-xs font-bold text-destructive transition hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
