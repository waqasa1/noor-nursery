"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const existing = items.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        );
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId && i.variantId === item.variantId
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, item.maxStock || 99) }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },
      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, i.maxStock || 99) }
              : i
          ),
        });
      },
      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + (i.unitPrice || 0) * i.quantity, 0),
      mergeItems: (serverItems) => {
        const local = get().items;
        const merged = [...local];
        for (const item of serverItems) {
          const existing = merged.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          );
          if (existing) {
            existing.quantity = Math.max(existing.quantity, item.quantity);
          } else {
            merged.push(item);
          }
        }
        set({ items: merged });
      },
    }),
    { name: "noor-cart" }
  )
);
