"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCartStore } from "@/store/cart";
import { formatPKR } from "@/lib/utils/currency";

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { items, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayItems = isMounted ? items : [];
  const subtotal = isMounted ? getSubtotal() : 0;

  return (
    <StoreLayout showFlashDeal={false}>
      <div className="mx-auto max-w-5xl px-4 py-12 lg:py-20">
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">Your Cart</h1>
            <p className="text-urdu mt-1 text-secondary text-lg" dir="rtl" lang="ur">آپ کا کارٹ</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="h-8 w-8" />
          </div>
        </div>

        {displayItems.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border bg-card py-24 text-center shadow-sm">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-surface-low text-muted-foreground">
              <ShoppingBag className="h-12 w-12" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground max-w-sm">Looks like you haven't added any plants to your cart yet.</p>
            <Link href="/shop" className="mt-8 flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition hover:bg-forest hover:shadow-lg">
              Browse Our Plants <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-12 flex flex-col gap-8 lg:flex-row">
            {/* Cart Items */}
            <div className="flex-1">
              <ul className="space-y-6" aria-label="Cart items">
                {displayItems.map((item) => (
                  <li key={`${item.productId}-${item.variantId}`} className="group flex gap-4 rounded-3xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md sm:p-6">
                    {item.image && (
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-32">
                        <img src={item.image} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-display text-lg font-bold text-foreground">{item.nameEn}</p>
                          <p className="text-urdu text-secondary" dir="rtl" lang="ur">{item.nameUr}</p>
                          <span className="mt-2 inline-block rounded-lg bg-surface-low px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            {item.sizeLabelEn}
                          </span>
                        </div>
                        <p className="font-display text-lg font-bold text-primary">{formatPKR(item.unitPrice)}</p>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full border bg-surface-low p-1">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                            className="grid h-8 w-8 place-items-center rounded-full bg-card text-foreground shadow-sm transition hover:text-primary"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span aria-live="polite" className="w-10 text-center font-semibold text-foreground">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                            className="grid h-8 w-8 place-items-center rounded-full bg-card text-foreground shadow-sm transition hover:text-primary"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${item.nameEn}`}
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-destructive transition hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Order Summary */}
            <div className="lg:w-80 xl:w-96">
              <div className="sticky top-24 rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
                <h2 className="font-display text-xl font-bold text-foreground">Order Summary</h2>
                
                <div className="mt-6 space-y-4 border-b pb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">{formatPKR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="font-medium text-foreground">Calculated at checkout</span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between font-display text-xl font-bold text-primary">
                  <span>Total</span>
                  <span>{formatPKR(subtotal)}</span>
                </div>
                
                <Link 
                  href="/checkout" 
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-4 font-bold text-primary-foreground transition hover:bg-forest hover:shadow-lg"
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Link>
                
                <button 
                  type="button" 
                  onClick={clearCart} 
                  className="mt-4 w-full rounded-full py-3 text-sm font-semibold text-muted-foreground transition hover:text-destructive"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
