"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCartStore } from "@/store/cart";
import { formatPKR } from "@/lib/utils/currency";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();

  return (
    <StoreLayout showFlashDeal={false}>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-primary">Your Cart</h1>
        <p className="text-urdu mt-1 text-secondary" dir="rtl" lang="ur">آپ کا کارٹ</p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border bg-card p-12 text-center">
            <p className="text-lg font-semibold">Your cart is empty</p>
            <Link href="/shop" className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
              Browse Plants
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-8 space-y-4" aria-label="Cart items">
              {items.map((item) => (
                <li key={`${item.productId}-${item.variantId}`} className="flex gap-4 rounded-2xl border bg-card p-4">
                  {item.image && (
                    <img src={item.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{item.nameEn}</p>
                    <p className="text-urdu text-sm text-secondary" dir="rtl" lang="ur">{item.nameUr}</p>
                    <p className="text-sm text-muted-foreground">{item.sizeLabelEn}</p>
                    <p className="mt-1 font-bold text-primary">{formatPKR(item.unitPrice)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="grid h-8 w-8 place-items-center rounded-full border"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span aria-live="polite" className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="grid h-8 w-8 place-items-center rounded-full border"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${item.nameEn}`}
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-destructive hover:underline"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border bg-card p-6">
              <div className="flex justify-between text-lg font-bold">
                <span>Subtotal</span>
                <span>{formatPKR(subtotal)}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Delivery calculated at checkout</p>
              <div className="mt-4 flex gap-3">
                <Link href="/checkout" className="flex-1 rounded-2xl bg-primary py-3 text-center font-bold text-primary-foreground hover:bg-forest">
                  Proceed to Checkout
                </Link>
                <button type="button" onClick={clearCart} className="rounded-2xl border px-4 py-3 text-sm font-semibold">
                  Clear Cart
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </StoreLayout>
  );
}
