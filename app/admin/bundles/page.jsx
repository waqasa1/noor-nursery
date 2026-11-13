"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminPageHeaderSkeleton, AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { formatPKR } from "@/lib/utils/currency";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

const EMPTY_FORM = {
  nameEn: "",
  nameUr: "",
  descriptionEn: "",
  descriptionUr: "",
  image: "",
  price: "",
  isActive: true,
  sortOrder: 0,
  items: [
    { productId: "", variantId: "", quantity: 1 },
    { productId: "", variantId: "", quantity: 1 },
  ],
};

function productLabel(p) {
  return p?.nameEn || "Product";
}

function variantOptions(product) {
  return (product?.variants || []).filter((v) => v.isActive !== false);
}

function partsTotal(items, productById) {
  return items.reduce((sum, row) => {
    const product = productById.get(row.productId);
    const variant = variantOptions(product).find((v) => v._id === row.variantId)
      || product?.variants?.find((v) => String(v._id) === String(row.variantId));
    if (!variant) return sum;
    return sum + Number(variant.price || 0) * Number(row.quantity || 0);
  }, 0);
}

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const productById = useMemo(() => {
    const map = new Map();
    for (const p of products) map.set(p._id, p);
    return map;
  }, [products]);

  const liveParts = partsTotal(form.items, productById);
  const setPrice = Number(form.price);
  const savings =
    Number.isFinite(setPrice) && setPrice >= 0 ? Math.max(0, liveParts - setPrice) : 0;

  const load = async () => {
    setLoading(true);
    try {
      const [bundleRes, plantRes, accessoryRes] = await Promise.all([
        fetch("/api/admin/bundles"),
        fetch("/api/admin/products?type=plant&limit=200"),
        fetch("/api/admin/products?type=accessory&limit=200"),
      ]);
      const [bundleData, plantData, accessoryData] = await Promise.all([
        bundleRes.json(),
        plantRes.json(),
        accessoryRes.json(),
      ]);
      if (bundleData.success) setBundles(bundleData.bundles || []);
      const merged = [
        ...(plantData.products || []),
        ...(accessoryData.products || []),
      ].map((p) => ({
        ...p,
        _id: p._id?.toString?.() || p._id,
        variants: (p.variants || []).map((v) => ({
          ...v,
          _id: v._id?.toString?.() || v._id,
        })),
      }));
      setProducts(merged);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
    setError("");
  };

  const openEdit = (bundle) => {
    setEditingId(bundle._id);
    setForm({
      nameEn: bundle.nameEn || "",
      nameUr: bundle.nameUr || "",
      descriptionEn: bundle.descriptionEn || "",
      descriptionUr: bundle.descriptionUr || "",
      image: bundle.image || "",
      price: bundle.price ?? "",
      isActive: bundle.isActive !== false,
      sortOrder: bundle.sortOrder ?? 0,
      items: (bundle.items || []).map((row) => ({
        productId:
          row.productId?._id?.toString?.() ||
          row.productId?.toString?.() ||
          row.productId ||
          "",
        variantId: row.variantId?.toString?.() || row.variantId || "",
        quantity: row.quantity || 1,
      })),
    });
    setFormOpen(true);
    setError("");
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  const updateItem = (index, field, value) => {
    setForm((f) => {
      const items = f.items.map((row, i) => {
        if (i !== index) return row;
        const next = { ...row, [field]: value };
        if (field === "productId") {
          const product = productById.get(value);
          const first = variantOptions(product)[0];
          next.variantId = first?._id || "";
        }
        return next;
      });
      return { ...f, items };
    });
  };

  const addItemRow = () => {
    setForm((f) => ({
      ...f,
      items: [...f.items, { productId: "", variantId: "", quantity: 1 }],
    }));
  };

  const removeItemRow = (index) => {
    setForm((f) => ({
      ...f,
      items: f.items.length <= 2 ? f.items : f.items.filter((_, i) => i !== index),
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      nameEn: form.nameEn.trim(),
      nameUr: form.nameUr.trim(),
      descriptionEn: form.descriptionEn.trim(),
      descriptionUr: form.descriptionUr.trim(),
      image: form.image.trim(),
      price: Number(form.price),
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
      items: form.items.map((row) => ({
        productId: row.productId,
        variantId: row.variantId,
        quantity: Number(row.quantity) || 1,
      })),
    };

    try {
      const url = editingId ? `/api/admin/bundles/${editingId}` : "/api/admin/bundles";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to save bundle");
        return;
      }
      setMessage(editingId ? "Bundle updated" : "Bundle created");
      closeForm();
      await load();
    } catch {
      setError("Failed to save bundle");
    } finally {
      setSaving(false);
    }
  };

  const archive = async (id) => {
    if (!window.confirm("Archive this bundle? It will be hidden from the storefront.")) return;
    const res = await fetch(`/api/admin/bundles/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      setError(data.message || "Could not archive bundle");
      return;
    }
    setMessage("Bundle archived");
    await load();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeaderSkeleton />
        <AdminTableSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bundles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build a set of plants and accessories, set one price, and sell it as a single deal.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New bundle
        </button>
      </div>

      {message && <p className="text-sm font-medium text-leaf">{message}</p>}
      {error && !formOpen && <p className="text-sm text-destructive">{error}</p>}

      {formOpen && (
        <form onSubmit={save} className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-semibold text-foreground">
              {editingId ? "Edit bundle" : "Create bundle"}
            </h2>
            <button type="button" onClick={closeForm} className="rounded-lg p-1 text-muted-foreground hover:bg-surface-low">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium">Name (English)</label>
              <input
                required
                value={form.nameEn}
                onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
                className="mt-1 w-full rounded-xl border bg-surface-low px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Name (Urdu)</label>
              <input
                value={form.nameUr}
                onChange={(e) => setForm((f) => ({ ...f, nameUr: e.target.value }))}
                className="mt-1 w-full rounded-xl border bg-surface-low px-3 py-2 text-sm"
                dir="rtl"
                lang="ur"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium">Short description (optional)</label>
              <textarea
                rows={2}
                value={form.descriptionEn}
                onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))}
                className="mt-1 w-full rounded-xl border bg-surface-low px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Bundle price (PKR)</label>
              <input
                required
                type="number"
                min={0}
                step={1}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="mt-1 w-full rounded-xl border bg-surface-low px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Parts total: {formatPKR(liveParts)}
                {Number.isFinite(setPrice) && setPrice >= 0
                  ? ` · Customer pays ${formatPKR(setPrice)}${savings > 0 ? ` (saves ${formatPKR(savings)})` : ""}`
                  : ""}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium">Sort order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                className="mt-1 w-full rounded-xl border bg-surface-low px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <ImageUpload
                label="Bundle image (optional)"
                value={form.image}
                onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                folder="noor-nursery/bundles"
                allowUrl
              />
              <p className="mt-1 text-xs text-muted-foreground">
                If empty, the storefront uses the first included product photo.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Active on storefront
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Included items</h3>
              <button
                type="button"
                onClick={addItemRow}
                className="text-sm font-medium text-secondary hover:underline"
              >
                Add item
              </button>
            </div>
            {form.items.map((row, index) => {
              const product = productById.get(row.productId);
              const variants = variantOptions(product);
              return (
                <div
                  key={index}
                  className="grid gap-2 rounded-xl border bg-surface-low/50 p-3 sm:grid-cols-[1fr_1fr_88px_auto]"
                >
                  <select
                    required
                    value={row.productId}
                    onChange={(e) => updateItem(index, "productId", e.target.value)}
                    className="rounded-lg border bg-card px-2 py-2 text-sm"
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {productLabel(p)}
                        {p.categoryId?.type === "accessory" ? " (accessory)" : ""}
                      </option>
                    ))}
                  </select>
                  <select
                    required
                    value={row.variantId}
                    onChange={(e) => updateItem(index, "variantId", e.target.value)}
                    className="rounded-lg border bg-card px-2 py-2 text-sm"
                    disabled={!row.productId}
                  >
                    <option value="">Select size</option>
                    {variants.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.sizeLabelEn} — {formatPKR(v.price)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={row.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    className="rounded-lg border bg-card px-2 py-2 text-sm"
                    aria-label="Quantity"
                  />
                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    disabled={form.items.length <= 2}
                    className="rounded-lg px-2 py-2 text-destructive disabled:opacity-40"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId ? "Save changes" : "Create bundle"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border px-5 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-surface-low/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Bundle</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bundles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No bundles yet. Create one to sell a set at a fixed price.
                </td>
              </tr>
            ) : (
              bundles.map((b) => (
                <tr key={b._id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{b.nameEn}</p>
                    {b.nameUr ? (
                      <p className="text-xs text-muted-foreground" dir="rtl" lang="ur">
                        {b.nameUr}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{formatPKR(b.price)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.items?.length || 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        b.isActive ? "bg-leaf/15 text-leaf" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {b.isActive ? "Active" : "Archived"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(b)}
                        className="rounded-lg border px-2.5 py-1.5 hover:bg-surface-low"
                        aria-label={`Edit ${b.nameEn}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {b.isActive && (
                        <button
                          type="button"
                          onClick={() => archive(b._id)}
                          className="rounded-lg border px-2.5 py-1.5 text-destructive hover:bg-destructive/10"
                          aria-label={`Archive ${b.nameEn}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
