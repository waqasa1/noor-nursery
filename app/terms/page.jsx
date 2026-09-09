import { PolicyPage } from "@/components/content/PolicyPage";

export const metadata = { title: "Terms of Service — Noor Nursery" };

export default function TermsPage() {
  return (
    <PolicyPage title="Terms of Service" titleUr="سروس کی شرائط">
      <p>By using noornursery.pk, you agree to these terms.</p>
      <h2>Orders</h2>
      <p>All orders are subject to product availability. We reserve the right to cancel orders with incorrect pricing due to system errors.</p>
      <h2>Pricing</h2>
      <p>Prices are in PKR and include applicable taxes unless stated otherwise. Delivery fees are calculated at checkout.</p>
      <h2>Payment</h2>
      <p>We accept COD, bank transfer, JazzCash, EasyPaisa, and PayFast where available.</p>
      <h2>Liability</h2>
      <p>Our liability is limited to the order value. We are not responsible for plant care after delivery.</p>
    </PolicyPage>
  );
}
