"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCartStore } from "@/store/cart";
import { formatPKR } from "@/lib/utils/currency";

const PAYMENT_METHODS = [
  { id: "cod", labelEn: "Cash on Delivery", labelUr: "کیش آن ڈیلیوری" },
  { id: "bank_transfer", labelEn: "Bank Transfer", labelUr: "بینک ٹرانسفر" },
  { id: "jazzcash", labelEn: "JazzCash", labelUr: "JazzCash" },
  { id: "easypaisa", labelEn: "EasyPaisa", labelUr: "EasyPaisa" },
  { id: "payfast", labelEn: "PayFast", labelUr: "PayFast" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [availableMethods, setAvailableMethods] = useState(["cod", "bank_transfer"]);
  const [validatedItems, setValidatedItems] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, deliveryFee: 0, total: 0 });
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
    if (items.length === 0) return;
    fetch("/api/cart/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })), city: form.city }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.items) setValidatedItems(data.items);
        if (data.totals) setTotals(data.totals);
      });
  }, [items, form.city]);

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

  if (items.length === 0) {
    return (
      <StoreLayout showFlashDeal={false}>
        <div className="mx-auto max-w-2xl px-4 py-14 text-center">
          <p className="text-lg font-semibold">Your cart is empty</p>
          <Link href="/shop" className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
            Continue Shopping
          </Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout showFlashDeal={false}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-primary">Checkout</h1>
        <p className="text-urdu mt-1 text-secondary" dir="rtl" lang="ur">چیک آؤٹ</p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border bg-card p-6">
              <h2 className="font-display text-lg font-bold">Contact Information</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  { id: "name", label: "Full Name", type: "text", required: true },
                  { id: "email", label: "Email", type: "email", required: true },
                  { id: "phone", label: "Phone", type: "tel", required: true },
                ].map((f) => (
                  <div key={f.id} className={f.id === "name" ? "sm:col-span-2" : ""}>
                    <label htmlFor={f.id} className="block text-sm font-medium">{f.label}</label>
                    <input
                      id={f.id}
                      type={f.type}
                      required={f.required}
                      value={form[f.id]}
                      onChange={(e) => update(f.id, e.target.value)}
                      className="mt-1 w-full rounded-xl border bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-6">
              <h2 className="font-display text-lg font-bold">Delivery Address</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  { id: "addressLine1", label: "Address Line 1", span: 2 },
                  { id: "addressLine2", label: "Address Line 2", span: 2 },
                  { id: "area", label: "Area / Colony" },
                  { id: "city", label: "City" },
                  { id: "province", label: "Province" },
                  { id: "postalCode", label: "Postal Code" },
                ].map((f) => (
                  <div key={f.id} className={f.span === 2 ? "sm:col-span-2" : ""}>
                    <label htmlFor={f.id} className="block text-sm font-medium">{f.label}</label>
                    <input
                      id={f.id}
                      required={["addressLine1", "area", "city", "province"].includes(f.id)}
                      value={form[f.id]}
                      onChange={(e) => update(f.id, e.target.value)}
                      className="mt-1 w-full rounded-xl border bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label htmlFor="deliveryInstructions" className="block text-sm font-medium">Delivery Instructions</label>
                  <textarea
                    id="deliveryInstructions"
                    rows={2}
                    value={form.deliveryInstructions}
                    onChange={(e) => update("deliveryInstructions", e.target.value)}
                    className="mt-1 w-full rounded-xl border bg-surface-low px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-6">
              <h2 className="font-display text-lg font-bold">Payment Method</h2>
              <div className="mt-4 space-y-2" role="radiogroup" aria-label="Payment method">
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      form.paymentMethod === m.id ? "border-secondary bg-surface-low" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.id}
                      checked={form.paymentMethod === m.id}
                      onChange={() => update("paymentMethod", m.id)}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-semibold">{m.labelEn}</span>
                      <span className="text-urdu ml-2 text-sm text-secondary" dir="rtl" lang="ur">{m.labelUr}</span>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                required
                checked={form.agreeToTerms}
                onChange={(e) => update("agreeToTerms", e.target.checked)}
                className="mt-1"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-secondary hover:underline">Terms</Link>,{" "}
                <Link href="/privacy-policy" className="text-secondary hover:underline">Privacy Policy</Link>, and{" "}
                <Link href="/return-policy" className="text-secondary hover:underline">Return Policy</Link>.
              </span>
            </label>
          </div>

          <div>
            <div className="sticky top-24 rounded-2xl border bg-card p-6">
              <h2 className="font-display text-lg font-bold">Order Summary</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {(validatedItems.length ? validatedItems : items).map((item) => (
                  <li key={`${item.productId}-${item.variantId}`} className="flex justify-between">
                    <span>{item.nameEn} × {item.quantity}</span>
                    <span>{formatPKR((item.unitPrice || 0) * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPKR(totals.subtotal || getSubtotal())}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>{formatPKR(totals.deliveryFee || 0)}</span></div>
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatPKR(totals.total || getSubtotal())}</span></div>
              </div>

              {errors.general && (
                <p role="alert" className="mt-4 text-sm text-destructive">{errors.general}</p>
              )}
              {Array.isArray(errors) && errors.map((e, i) => (
                <p key={i} role="alert" className="mt-2 text-sm text-destructive">{e}</p>
              ))}

              <button
                type="submit"
                disabled={submitting}
                aria-live="polite"
                className="mt-6 w-full rounded-2xl bg-primary py-4 font-bold text-primary-foreground hover:bg-forest disabled:opacity-50"
              >
                {submitting ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </StoreLayout>
  );
}
