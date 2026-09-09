import { PolicyPage } from "@/components/content/PolicyPage";

export const metadata = { title: "Shipping Policy — Noor Nursery" };

export default function ShippingPolicyPage() {
  return (
    <PolicyPage title="Shipping & Delivery Policy" titleUr="شپنگ اور ڈیلیوری پالیسی">
      <h2>Delivery Areas</h2>
      <p>We deliver across 50+ Pakistani cities including Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, and Peshawar.</p>
      <h2>Delivery Times</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>Lahore: 1–2 business days (same-day available)</li>
        <li>Major cities: 2–4 business days</li>
        <li>Other areas: 3–6 business days</li>
      </ul>
      <h2>Delivery Fees</h2>
      <p>Standard delivery fee applies. Free delivery on orders over PKR 2,500. City-specific rates may apply.</p>
      <h2>48-Hour Live Arrival Guarantee</h2>
      <p>If your plant arrives damaged, contact us within 48 hours with photos for a free replacement or full refund.</p>
    </PolicyPage>
  );
}
