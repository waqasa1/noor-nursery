import { PolicyPage } from "@/components/content/PolicyPage";

export const metadata = { title: "Terms of Service — Noor Nursery" };

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms of Service"
      titleUr="سروس کی شرائط"
      lead="The rules for shopping at noornursery.pk — orders, pricing, payments, and liability."
      updated="October 2026"
    >
      <p>
        By using noornursery.pk you agree to these terms. Noor Nursery is an online plant retailer based in Lahore,
        Pakistan.
      </p>
      <h2>Orders</h2>
      <p>All orders are subject to product availability. We reserve the right to cancel orders with incorrect pricing due to system errors.</p>
      <h2>Pricing &amp; delivery</h2>
      <p>
        Prices are in PKR. Delivery fees are calculated at checkout. Orders of PKR 2,500 or more qualify for free
        standard delivery unless checkout shows otherwise. Promo codes (for example NOOR20) are separate from free
        delivery and may change without notice.
      </p>
      <h2>Payment</h2>
      <p>
        We accept Cash on Delivery and JazzCash. JazzCash is a manual Send Money transfer: you send the order total
        from your JazzCash app, submit the TID / TrxID on your order page, and we ship only after we verify that
        transfer in our own JazzCash account. We never ask for your JazzCash PIN or OTP.
      </p>
      <h2>Liability</h2>
      <p>Our liability is limited to the order value. We are not responsible for plant care after delivery, except as stated in the Live Arrival Guarantee and Return Policy.</p>
    </PolicyPage>
  );
}
