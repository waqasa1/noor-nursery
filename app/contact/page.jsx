import { PolicyPage } from "@/components/content/PolicyPage";

export const metadata = { title: "Contact — Noor Nursery" };

export default function ContactPage() {
  return (
    <PolicyPage title="Contact Us" titleUr="رابطہ کریں">
      <p>We&apos;re here to help with orders, plant care, and bulk inquiries.</p>
      <h2>Phone &amp; WhatsApp</h2>
      <p><a href="tel:+923492849062" className="text-secondary font-semibold hover:underline">+92 349 2849062</a></p>
      <h2>Email</h2>
      <p><a href="mailto:orders@noornursery.pk" className="text-secondary font-semibold hover:underline">orders@noornursery.pk</a></p>
      <h2>Delivery Areas</h2>
      <p>Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and 50+ cities across Pakistan.</p>
      <p dir="rtl" lang="ur" className="text-urdu">لاہور، کراچی، اسلام آباد اور 50+ شہروں میں ڈیلیوری۔</p>
    </PolicyPage>
  );
}
