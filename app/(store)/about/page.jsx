import { PolicyPage } from "@/components/content/PolicyPage";
import { BRAND } from "@/lib/brand";

export const metadata = {
  title: "About Us — Noor Nursery",
  description: `${BRAND.sloganPrimary} Pakistan's trusted online nursery since 2012.`,
};

export default function AboutPage() {
  return (
    <PolicyPage title="About Noor Nursery" titleUr="نور نرسری کے بارے میں">
      <p className="font-medium text-secondary">{BRAND.sloganPrimary}</p>
      <p className="font-medium text-secondary">{BRAND.sloganSecondary}</p>
      <p>Nurturing homes and gardens across Pakistan since 2012. Noor Nursery delivers healthy, hardened plants acclimatized for Karachi coastal air, Punjab plains, and Northern hill climates.</p>
      <p dir="rtl" lang="ur" className="text-urdu">2012 سے پاکستان بھر میں گھروں اور باغات کو سرسبز بناتے ہوئے۔</p>
      <h2>Our Mission</h2>
      <p>Make quality plants accessible to every Pakistani home with guaranteed live arrival, expert care guidance, and reliable nationwide delivery.</p>
      <h2>Why Choose Us</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>300+ acclimatized plant varieties</li>
        <li>48-hour live arrival guarantee</li>
        <li>Shock-resistant packaging for courier delivery</li>
        <li>Cash on Delivery across 50+ cities</li>
        <li>Bilingual care instructions in English and Urdu</li>
      </ul>
    </PolicyPage>
  );
}
