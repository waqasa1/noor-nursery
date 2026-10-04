"use client";

import { ChevronDown } from "lucide-react";
import { formatPKR } from "@/lib/utils/currency";

/**
 * Size picker used on product cards.
 * - 1 size  → static label (a dropdown with one option is noise)
 * - 2+ sizes → native <select> so 5-size products stay compact;
 *              each option shows the size and its own price.
 */
export function SizeSelect({ variants, selectedId, onChange, selectId, compact = false }) {
  if (!variants?.length) return null;

  const label = (
    <span className="flex items-baseline gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
      Size
      <span className="text-urdu text-[11px] normal-case tracking-normal text-secondary" dir="rtl" lang="ur">
        سائز
      </span>
    </span>
  );

  if (variants.length === 1) {
    return (
      <div className="flex items-baseline justify-between gap-2">
        {label}
        <span className="text-xs font-bold text-foreground">{variants[0].sizeLabelEn}</span>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={selectId} className="flex items-baseline justify-between gap-2">
        {label}
        <span className="text-[11px] font-semibold text-muted-foreground">Choose a size</span>
      </label>
      <div className="relative mt-1">
        <select
          id={selectId}
          value={selectedId ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className={`w-full cursor-pointer appearance-none rounded-xl border-2 border-foreground/20 bg-white pr-9 font-semibold text-foreground outline-none transition hover:border-secondary focus:border-secondary ${
            compact ? "py-2 pl-3 text-[13px]" : "py-2.5 pl-3.5 text-sm"
          }`}
        >
          {variants.map((v) => (
            <option key={v._id} value={v._id} disabled={v.stock <= 0}>
              {v.sizeLabelEn} — {formatPKR(v.price)}
              {v.stock <= 0 ? " (out of stock)" : ""}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
      </div>
    </div>
  );
}

/** Keeps the first in-stock size selected for a variant list. */
export function defaultSizeId(variants = []) {
  const inStock = variants.filter((v) => v.isActive !== false && v.stock > 0);
  const pool = inStock.length ? inStock : variants.filter((v) => v.isActive !== false);
  return pool[0]?._id;
}
