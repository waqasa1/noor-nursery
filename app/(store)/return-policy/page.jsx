import { PolicyPage } from "@/components/content/PolicyPage";

export const metadata = { title: "Return Policy — Noor Nursery" };

export default function ReturnPolicyPage() {
  return (
    <PolicyPage
      title="Return & Refund Policy"
      titleUr="واپسی اور رقم واپسی کی پالیسی"
      lead="Live arrival guarantee, replacements, and how JazzCash refunds work."
      updated="October 2026"
    >
      <h2>Live Arrival Guarantee</h2>
      <p>We offer a 100% live arrival guarantee. Report damaged plants within 48 hours of delivery with photos via WhatsApp or email.</p>
      <h2>Replacements</h2>
      <p>We will dispatch a fresh replacement at no extra cost or issue a full refund to your original payment method.</p>
      <h2>Prepaid JazzCash Orders</h2>
      <p>
        Orders paid in advance by JazzCash are confirmed only after we verify your TID / TrxID in our own
        JazzCash account. Once marked <strong>Payment received</strong>, the order is confirmed and cannot be
        cancelled for a change of mind. If something arrives damaged, the Live Arrival Guarantee above still
        applies, and approved refunds for prepaid orders are transferred back to the same JazzCash number within
        2–3 working days.
      </p>
      <h2>Non-Returnable Items</h2>
      <p>Fertilizers, soil, and opened care products cannot be returned for hygiene reasons.</p>
    </PolicyPage>
  );
}
