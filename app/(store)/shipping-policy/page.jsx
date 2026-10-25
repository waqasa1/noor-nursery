import { PolicyPage } from "@/components/content/PolicyPage";

export const metadata = { title: "Shipping Policy — Noor Nursery" };

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Shipping & Delivery Policy"
      titleUr="شپنگ اور ڈیلیوری پالیسی"
      lead="Where we deliver, how long it takes, free-delivery threshold, and how order status works."
      updated="October 2026"
    >
      <h2>Delivery Areas</h2>
      <p>
        We deliver across 50+ Pakistani cities including Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan,
        and Peshawar.
      </p>

      <h2>Delivery Times</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Lahore: 1–2 business days (same-day available when capacity allows)</li>
        <li>Major cities: 2–4 business days</li>
        <li>Other areas: 3–6 business days</li>
      </ul>

      <h2>Delivery Fees</h2>
      <p>
        A standard delivery fee is calculated at checkout. <strong>Free delivery on orders of PKR 2,500 or more</strong>
        {" "}(before promo discounts, subject to the total shown at checkout). City-specific rates may apply for remote areas.
      </p>
      <p>
        Promotional codes such as <strong>NOOR20</strong> (percentage off) are separate from free-delivery eligibility.
        Always check the checkout summary for the fee that applies to your cart.
      </p>

      <h2>Payments &amp; dispatch</h2>
      <p>
        Cash on Delivery: pay the courier when your parcel arrives. JazzCash: send the exact total via JazzCash Send
        Money, submit your TID / TrxID on the order page, and we dispatch after we verify the transfer in our JazzCash
        account.
      </p>

      <h2>Tracking</h2>
      <p>
        Use <a href="/track-order" className="font-semibold text-secondary hover:underline">Track your order status</a>{" "}
        with your order number and checkout email or phone to see our internal status (payment, packing, shipped,
        delivered). This is not live courier GPS tracking. After dispatch, message us on WhatsApp if you need the
        latest courier update.
      </p>

      <h2>48-Hour Live Arrival Guarantee</h2>
      <p>
        If your plant arrives damaged, contact us within 48 hours with photos for a free replacement or full refund.
        See our <a href="/return-policy" className="font-semibold text-secondary hover:underline">Return Policy</a>.
      </p>
    </PolicyPage>
  );
}
