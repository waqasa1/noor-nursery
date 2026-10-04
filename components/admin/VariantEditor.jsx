"use client";

import { Plus, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "Extra Large" },
  { value: "xxlarge", label: "XX Large" },
];

export const EMPTY_VARIANT = {
  size: "medium",
  sizeLabelEn: "",
  sizeLabelUr: "",
  sku: "",
  price: 0,
  compareAtPrice: 0,
  stock: 10,
  isActive: true,
  image: "",
};

export function VariantEditor({ variants = [], onChange }) {
  const update = (index, field, value) => {
    const next = [...variants];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const remove = (index) => onChange(variants.filter((_, i) => i !== index));

  const add = () => onChange([...variants, { ...EMPTY_VARIANT }]);

  return (
    <section className="field-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="field-label-normal">Sizes, prices &amp; stock</h3>
          <p className="field-hint">
            Each row is one buyable size. The Size Title is what customers see on the product card and detail page.
          </p>
        </div>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 rounded-full border-2 border-secondary bg-white px-3.5 py-2 text-xs font-bold text-secondary transition hover:bg-secondary hover:text-secondary-foreground"
        >
          <Plus className="h-4 w-4" /> Add Size
        </button>
      </div>

      {variants.length === 0 && (
        <p className="mt-4 rounded-xl border-2 border-dashed border-foreground/25 bg-surface-low px-4 py-6 text-center text-sm font-semibold text-muted-foreground">
          No sizes yet — add at least one.
        </p>
      )}

      <div className="mt-4 space-y-4">
        {variants.map((v, i) => (
          <div key={v._id || i} className="rounded-xl border-2 border-foreground/15 bg-surface-low/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                Size {i + 1}
              </span>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="flex items-center gap-1 rounded-lg border-2 border-destructive/40 bg-white px-2 py-1 text-xs font-bold text-destructive transition hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="field-label" htmlFor={`size-${i}`}>Size *</label>
                <select
                  id={`size-${i}`}
                  className="field-select"
                  value={v.size}
                  onChange={(e) => update(i, "size", e.target.value)}
                >
                  {SIZE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor={`title-en-${i}`}>Size Title (English) *</label>
                <input
                  id={`title-en-${i}`}
                  className="field-input"
                  value={v.sizeLabelEn}
                  onChange={(e) => update(i, "sizeLabelEn", e.target.value)}
                  placeholder='e.g. Small 6", 1 kg, 4 ft'
                  required
                />
              </div>

              <div>
                <label className="field-label" htmlFor={`title-ur-${i}`}>Size Title (Urdu)</label>
                <input
                  id={`title-ur-${i}`}
                  className="field-input"
                  dir="rtl"
                  lang="ur"
                  value={v.sizeLabelUr || ""}
                  onChange={(e) => update(i, "sizeLabelUr", e.target.value)}
                  placeholder="مثلاً چھوٹا، 1 کلو"
                />
              </div>

              <div>
                <label className="field-label" htmlFor={`price-${i}`}>Price (PKR) *</label>
                <input
                  id={`price-${i}`}
                  type="number"
                  min="0"
                  className="field-input"
                  value={v.price ?? 0}
                  onChange={(e) => update(i, "price", Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="field-label" htmlFor={`compare-${i}`}>Compare-at Price (PKR)</label>
                <input
                  id={`compare-${i}`}
                  type="number"
                  min="0"
                  className="field-input"
                  value={v.compareAtPrice ?? 0}
                  onChange={(e) => update(i, "compareAtPrice", Number(e.target.value))}
                  placeholder="0 = none"
                />
                <p className="field-hint">Shown struck-through when higher than the price.</p>
              </div>

              <div>
                <label className="field-label" htmlFor={`stock-${i}`}>Stock *</label>
                <input
                  id={`stock-${i}`}
                  type="number"
                  min="0"
                  className="field-input"
                  value={v.stock ?? 0}
                  onChange={(e) => update(i, "stock", Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="field-label" htmlFor={`sku-${i}`}>SKU</label>
                <input
                  id={`sku-${i}`}
                  className="field-input"
                  value={v.sku || ""}
                  onChange={(e) => update(i, "sku", e.target.value)}
                  placeholder="Optional code"
                />
              </div>

              <div className="flex items-end pb-1">
                <label className="field-check w-full">
                  <input
                    type="checkbox"
                    checked={v.isActive !== false}
                    onChange={(e) => update(i, "isActive", e.target.checked)}
                  />
                  Sell this size
                </label>
              </div>
            </div>

            <div className="mt-3">
              <ImageUpload
                label={`Picture for "${v.sizeLabelEn || SIZE_OPTIONS.find((s) => s.value === v.size)?.label}" (optional)`}
                value={v.image || ""}
                onChange={(url) => update(i, "image", url)}
                folder="noor-nursery/products/variants"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
