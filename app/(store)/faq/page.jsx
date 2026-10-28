import Link from "next/link";
import { Leaf } from "lucide-react";
import { PlantFinder } from "@/components/plants/PlantFinder";
import { IMAGES } from "@/components/nursery/data";
import { getStoreFaqs } from "@/lib/faqs.server";
import { faqJsonLd } from "@/lib/seo/structured-data";
import { JsonLdScript } from "@/lib/seo/JsonLdScript";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Plant Finder & FAQ",
  description:
    "Find the right plant for your space, then browse FAQs on delivery, JazzCash, COD, and plant care for Pakistani homes.",
  path: "/faq",
});

export default async function PlantCareGuidePage() {
  const faqs = await getStoreFaqs();

  return (
    <>
      <JsonLdScript data={faqJsonLd(faqs)} />

      <div className="relative h-64 w-full bg-primary lg:h-80">
        <div className="absolute inset-0 z-0 opacity-30">
          <img src={IMAGES.indoor} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-primary/70 mix-blend-multiply" />
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-leaf text-leaf-foreground shadow-lg">
            <Leaf className="h-7 w-7" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
            Plant Finder &amp; FAQ
          </h1>
          <p className="mt-3 max-w-xl text-sm text-primary-foreground/85">
            Two tools on one page: a quick plant finder quiz, then answers about shipping, payments, and care.
          </p>
          <p className="text-urdu mt-2 text-lg text-primary-foreground/90" dir="rtl" lang="ur">
            پودا تلاش کریں اور اکثر پوچھے گئے سوالات
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm">
            <a
              href="#plant-finder"
              className="rounded-full bg-leaf px-4 py-2 font-semibold text-leaf-foreground transition hover:bg-gold hover:text-gold-foreground"
            >
              Plant Finder
            </a>
            <a
              href="#faq"
              className="rounded-full border border-primary-foreground/40 bg-primary-foreground/10 px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary-foreground/20"
            >
              FAQ
            </a>
            <Link
              href="/track-order"
              className="rounded-full border border-primary-foreground/40 bg-primary-foreground/10 px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary-foreground/20"
            >
              Order status
            </Link>
          </div>
        </div>
      </div>

      <PlantFinder />

      <section id="faq" className="mx-auto max-w-4xl scroll-mt-24 px-4 py-16">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">Help & Answers</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Common questions about delivery, plant care, and ordering in Pakistan
          </p>
        </div>

        {faqs.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            No FAQs published yet. Check back soon, or contact us on WhatsApp.
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {faqs.map((faq, i) => (
              <details key={faq.id || i} className="rounded-2xl border bg-card p-5 shadow-sm">
                <summary className="cursor-pointer font-semibold text-foreground">{faq.q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
