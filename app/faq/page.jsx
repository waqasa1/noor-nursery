import { PolicyPage } from "@/components/content/PolicyPage";
import { FAQS } from "@/components/nursery/data";
import { faqJsonLd } from "@/lib/seo/structured-data";
import { JsonLdScript } from "@/lib/seo/JsonLdScript";

export const metadata = { title: "FAQ — Noor Nursery", description: "Frequently asked questions about ordering, delivery, and plant care." };

export default function FaqPage() {
  return (
    <PolicyPage title="Frequently Asked Questions" titleUr="اکثر پوچھے گئے سوالات">
      <JsonLdScript data={faqJsonLd(FAQS)} />
      <div className="space-y-4">
        {FAQS.map((faq, i) => (
          <details key={i} className="rounded-2xl border bg-card p-4">
            <summary className="cursor-pointer font-semibold text-foreground">{faq.q}</summary>
            <p className="mt-3 text-sm leading-relaxed">{faq.a}</p>
          </details>
        ))}
      </div>
    </PolicyPage>
  );
}
