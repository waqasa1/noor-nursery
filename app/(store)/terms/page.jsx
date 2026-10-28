import { PolicyPage } from "@/components/content/PolicyPage";
import { getDeliveryConfig, getBannerConfig } from "@/lib/settings";
import { formatPKR } from "@/lib/utils/currency";

export const dynamic = "force-dynamic";

export const metadata = { title: "Terms of Service — Noor Nursery" };

export default async function TermsPage() {
  let freeThreshold = 2500;
  let promoCode = "";
  try {
    const [delivery, banner] = await Promise.all([
      getDeliveryConfig(),
      getBannerConfig(),
    ]);
    freeThreshold = delivery.freeThreshold;
    promoCode = banner.active ? String(banner.code || "").trim().toUpperCase() : "";
  } catch {
    /* use defaults when DB unavailable at build/runtime */
  }
  const thresholdLabel = formatPKR(freeThreshold);

  return (
    <PolicyPage
      title="Terms of Service"
      titleUr="سروس کی شرائط"
      lead="The rules for shopping at noornursery.pk — orders, pricing, payments, and liability."
      updated="October 2026"
    >
      <p>
        By using noornursery.pk you agree to these terms. Noor Nursery is an online plant retailer based in Karachi,
        Pakistan.
      </p>
      <h2>Orders</h2>
      <p>All orders are subject to product availability. We reserve the right to cancel orders with incorrect pricing due to system errors.</p>
      <h2>Pricing &amp; delivery</h2>
      <p>
        Prices are in PKR. Delivery fees are calculated at checkout. Orders of {thresholdLabel} or more qualify for free
        standard delivery unless checkout shows otherwise.
        {promoCode
          ? ` Promo codes (for example ${promoCode}) are separate from free delivery and may change without notice.`
          : " Promo codes shown on the storefront are separate from free delivery and may change without notice."}
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
