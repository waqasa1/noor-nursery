import { PolicyPage } from "@/components/content/PolicyPage";

export const metadata = { title: "Privacy Policy — Noor Nursery" };

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy Policy" titleUr="رازداری کی پالیسی">
      <p>Last updated: {new Date().getFullYear()}</p>
      <h2>Information We Collect</h2>
      <p>We collect name, email, phone, and delivery address when you place an order or create an account.</p>
      <h2>How We Use Your Data</h2>
      <p>Your information is used to process orders, send transactional emails, and improve our service. We do not sell your data.</p>
      <h2>Security</h2>
      <p>Passwords are hashed. Payment credentials are never stored on our servers.</p>
      <h2>Contact</h2>
      <p>For privacy inquiries, email orders@noornursery.pk</p>
    </PolicyPage>
  );
}
