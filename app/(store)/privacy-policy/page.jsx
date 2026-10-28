import { PolicyPage } from "@/components/content/PolicyPage";
import { BRAND, storePublicEmail } from "@/lib/brand";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Noor Nursery collects, uses, and protects your information.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  const email = storePublicEmail();

  return (
    <PolicyPage
      title="Privacy Policy"
      titleUr="رازداری کی پالیسی"
      lead="How Noor Nursery collects, uses, and protects your information when you shop or contact us."
      updated="October 2026"
    >
      <p>
        {BRAND.name} (&quot;we&quot;, &quot;us&quot;) operates noornursery.pk as an online plant retailer based in{" "}
        {BRAND.city}. This policy explains what we collect, why, and how you can reach us.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>Account details: name, email, phone, and hashed password if you register.</li>
        <li>Order details: delivery address, items, payment method, and order notes.</li>
        <li>
          Payment references: for JazzCash we store the TID / TrxID you submit so we can verify the transfer. We do
          not store JazzCash PINs, OTPs, or full wallet credentials.
        </li>
        <li>Messages you send via the contact form, email, or WhatsApp.</li>
        <li>Basic technical data such as IP address used for rate-limiting and fraud prevention.</li>
      </ul>

      <h2>How we use your data</h2>
      <ul>
        <li>To process and deliver orders, and to send transactional emails (confirmation, payment, status).</li>
        <li>To verify prepaid JazzCash payments and answer support requests.</li>
        <li>To improve the store (catalog, delivery estimates, and site reliability).</li>
        <li>We do not sell your personal data.</li>
      </ul>

      <h2>Order status lookups</h2>
      <p>
        The track-order page shows our internal order status when you provide the order number plus the email or phone
        used at checkout. Wrong combinations return a generic &quot;not found&quot; message so we do not reveal
        whether an order number exists.
      </p>

      <h2>Sharing</h2>
      <p>
        We share only what is needed with delivery partners to ship your plants, and with email delivery providers to
        send transactional mail. We do not share data for advertising networks.
      </p>

      <h2>Security</h2>
      <p>
        Passwords are hashed. Session cookies are used to keep you signed in. Access to order payment links requires a
        secret token. No system is perfectly secure; contact us immediately if you suspect misuse of your account.
      </p>

      <h2>Retention</h2>
      <p>
        We keep order records as long as needed for fulfilment, accounting, returns, and legal obligations. You may ask
        us to update or delete account details that are not required for completed orders.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions:{" "}
        <a href={`mailto:${email}`}>{email}</a>
        . Phone / WhatsApp: +92 349 2849062.
      </p>
    </PolicyPage>
  );
}
