"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCartStore } from "@/store/cart";
import { formatPKR } from "@/lib/utils/currency";
import { CreditCard, Truck, AlertCircle } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { items, getSubtotal, clearCart } = useCartStore();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [validatedItems, setValidatedItems] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, deliveryFee: 0, discount: 0, total: 0 });
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    area: "",
    city: "Lahore",
    province: "Punjab",
    postalCode: "",
    deliveryInstructions: "",
    paymentMethod: "cod",
    customerNote: "",
    agreeToTerms: false,
  });

  useEffect(() => {
    setIsMounted(true);
    fetch("/api/checkout")
      .then((r) => r.json())
      .then((data) => {
        if (data.paymentMethods?.length) {
          setPaymentMethods(data.paymentMethods);
          setForm((f) => ({ ...f, paymentMethod: data.paymentMethods[0].id }));
        }
      });
  }, []);

  useEffect(() => {
    if (!isMounted || items.length === 0) return;
    fetch("/api/cart/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        city: form.city,
        promoCode: appliedPromo || undefined,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.items) setValidatedItems(data.items);
        if (data.totals) setTotals(data.totals);
      });
  }, [items, form.city, appliedPromo, isMounted]);

  const applyPromo = async () => {
    setPromoError("");
    const res = await fetch("/api/cart/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        city: form.city,
        promoCode,
      }),
    });
    const data = await res.json();
    if (data.promo?.error) {
      setPromoError(data.promo.error);
      setAppliedPromo(null);
      return;
    }
    if (data.promo?.code) {
      setAppliedPromo(data.promo.code);
      setPromoError("");
    }
  };

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        customer: { name: form.name, email: form.email, phone: form.phone },
        shippingAddress: {
          fullName: form.fullName || form.name,
          phone: form.phone,
          email: form.email,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          area: form.area,
          city: form.city,
          province: form.province,
          postalCode: form.postalCode,
          deliveryInstructions: form.deliveryInstructions,
        },
        paymentMethod: form.paymentMethod,
        promoCode: appliedPromo || undefined,
        customerNote: form.customerNote,
        agreeToTerms: form.agreeToTerms,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!data.success) {
      setErrors(data.errors || { general: data.message });
      return;
    }

    clearCart();

    if (data.payment?.formAction && data.payment?.formParams) {
      const formEl = document.createElement("form");
      formEl.method = "POST";
      formEl.action = data.payment.formAction;
      Object.entries(data.payment.formParams).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = v;
        formEl.appendChild(input);
      });
      document.body.appendChild(formEl);
      formEl.submit();
      return;
    }

    router.push(data.payment?.redirectUrl || `/order-success/${data.order.orderNumber}`);
  };

  const displayItems = isMounted ? items : [];

  if (isMounted && displayItems.length === 0) {
    return (
      <StoreLayout showFlashDeal={false}>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-surface-low text-muted-foreground">
            <Truck className="h-12 w-12" />
          </div>
          <h2 className="font-display text-2xl font-bold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">Add some plants to proceed to checkout.</p>
          <Link href="/shop" className="mt-8 inline-block rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground hover:bg-forest">
            Continue Shopping
          </Link>
        </div>
      </StoreLayout>
    );
  }

  // Prevents rendering the form on the server to avoid hydration mismatch
  if (!isMounted) {
    return (
      <StoreLayout showFlashDeal={false}>
        <div className="mx-auto max-w-7xl px-4 py-12 lg:py-20 text-center">
           <div className="h-64 animate-pulse rounded-3xl bg-surface-low"></div>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout showFlashDeal={false}>
      <div className="mx-auto max-w-7xl px-4 py-12 lg:py-20">
        <div className="mb-10 text-center lg:text-left">
          <h1 className="font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">Secure Checkout</h1>
          <p className="text-urdu mt-2 text-lg text-secondary" dir="rtl" lang="ur">محفوظ چیک آؤٹ</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7 xl:col-span-8">
            <section className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-xl font-bold text-foreground">1. Contact Information</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {[
                  { id: "name", label: "Full Name", type: "text", required: true },
                  { id: "email", label: "Email Address", type: "email", required: true },
                  { id: "phone", label: "Phone Number", type: "tel", required: true },
                ].map((f) => (
                  <div key={f.id} className={f.id === "name" ? "sm:col-span-2" : ""}>
                    <label htmlFor={f.id} className="block text-sm font-medium text-foreground">{f.label}</label>
                    <input
                      id={f.id}
                      type={f.type}
                      required={f.required}
                      value={form[f.id]}
                      onChange={(e) => update(f.id, e.target.value)}
                      className="mt-2 w-full rounded-2xl border bg-surface-low px-4 py-3 text-sm outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-xl font-bold text-foreground">2. Delivery Address</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {[
                  { id: "addressLine1", label: "Address Line 1", span: 2 },
                  { id: "addressLine2", label: "Address Line 2 (Optional)", span: 2 },
                  { id: "area", label: "Area / Colony" },
                  { id: "city", label: "City" },
                  { id: "province", label: "Province" },
                  { id: "postalCode", label: "Postal Code" },
                ].map((f) => (
                  <div key={f.id} className={f.span === 2 ? "sm:col-span-2" : ""}>
                    <label htmlFor={f.id} className="block text-sm font-medium text-foreground">{f.label}</label>
                    <input
                      id={f.id}
                      required={["addressLine1", "area", "city", "province"].includes(f.id)}
                      value={form[f.id]}
                      onChange={(e) => update(f.id, e.target.value)}
                      className="mt-2 w-full rounded-2xl border bg-surface-low px-4 py-3 text-sm outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label htmlFor="deliveryInstructions" className="block text-sm font-medium text-foreground">Delivery Instructions (Optional)</label>
                  <textarea
                    id="deliveryInstructions"
                    rows={3}
                    value={form.deliveryInstructions}
                    onChange={(e) => update("deliveryInstructions", e.target.value)}
                    className="mt-2 w-full rounded-2xl border bg-surface-low px-4 py-3 text-sm outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-xl font-bold text-foreground">3. Payment Method</h2>
              <div className="mt-6 space-y-3" role="radiogroup" aria-label="Payment method">
                {paymentMethods.map((m) => (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all ${
                      form.paymentMethod === m.id ? "border-secondary bg-surface-low shadow-sm" : "hover:border-primary/30"
                    }`}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${form.paymentMethod === m.id ? "border-secondary" : "border-muted-foreground"}`}>
                      {form.paymentMethod === m.id && <div className="h-2.5 w-2.5 rounded-full bg-secondary"></div>}
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.id}
                      checked={form.paymentMethod === m.id}
                      onChange={() => update("paymentMethod", m.id)}
                      className="hidden"
                    />
                    <div className="flex flex-1 items-center justify-between">
                      <span className="font-medium text-foreground">{m.labelEn}</span>
                      <span className="text-urdu text-sm text-secondary" dir="rtl" lang="ur">{m.labelUr}</span>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
                <h2 className="font-display text-xl font-bold text-foreground">Order Summary</h2>
                
                <ul className="mt-6 space-y-4 border-b border-border pb-6">
                  {(validatedItems.length ? validatedItems : displayItems).map((item) => (
                    <li key={`${item.productId}-${item.variantId}`} className="flex gap-4">
                      {item.image && (
                        <div className="h-16 w-16 shrink-0 rounded-xl bg-surface-low">
                          <img src={item.image} alt="" className="h-full w-full rounded-xl object-cover" />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col justify-center">
                        <p className="text-sm font-semibold text-foreground">{item.nameEn}</p>
                        <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                          <span>Qty: {item.quantity}</span>
                          <span className="font-medium text-foreground">{formatPKR((item.unitPrice || 0) * item.quantity)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6 space-y-3">
                  <label className="block text-sm font-medium text-foreground">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="NOOR20"
                      className="flex-1 rounded-xl border bg-surface-low px-3 py-2 text-sm uppercase"
                    />
                    <button
                      type="button"
                      onClick={applyPromo}
                      className="rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedPromo && (
                    <p className="text-xs font-medium text-leaf">Code {appliedPromo} applied</p>
                  )}
                  {promoError && (
                    <p className="text-xs text-destructive">{promoError}</p>
                  )}
                </div>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">{formatPKR(totals.subtotal || getSubtotal())}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="font-medium text-foreground">{formatPKR(totals.deliveryFee || 0)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-leaf">
                      <span>Discount</span>
                      <span className="font-medium">−{formatPKR(totals.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-4 font-display text-xl font-bold text-primary">
                    <span>Total</span>
                    <span>{formatPKR(totals.total || getSubtotal())}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <label className="flex items-start gap-3 rounded-xl bg-surface-low p-4 text-sm">
                    <input
                      type="checkbox"
                      required
                      checked={form.agreeToTerms}
                      onChange={(e) => update("agreeToTerms", e.target.checked)}
                      className="mt-0.5 rounded"
                    />
                    <span className="text-muted-foreground">
                      I agree to the <Link href="/terms" className="font-medium text-secondary hover:underline">Terms</Link> &amp; <Link href="/return-policy" className="font-medium text-secondary hover:underline">Return Policy</Link>.
                    </span>
                  </label>
                </div>

                {errors.general && (
                  <div className="mt-6 flex items-start gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{errors.general}</p>
                  </div>
                )}
                {Array.isArray(errors) && errors.length > 0 && (
                  <div className="mt-6 flex flex-col gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
                    {errors.map((e, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{e}</p>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  aria-live="polite"
                  className="mt-6 w-full rounded-full bg-primary py-4 font-bold text-primary-foreground transition hover:bg-forest disabled:opacity-70"
                >
                  {submitting ? "Processing Securely..." : "Place Order Now"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </StoreLayout>
  );
}
