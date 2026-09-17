import { StoreLayout } from "@/components/layout/StoreLayout";
import { PlantFinder } from "@/components/plants/PlantFinder";
import { FAQS } from "@/components/nursery/data";
import { IMAGES } from "@/components/nursery/data";
import { faqJsonLd } from "@/lib/seo/structured-data";
import { JsonLdScript } from "@/lib/seo/JsonLdScript";
import { Leaf } from "lucide-react";

export const metadata = {
  title: "Plant Care Guide — Noor Nursery",
  description:
    "Find the right plant for your space with our interactive plant finder. Care tips, FAQs, and expert guidance for Pakistani homes and gardens.",
};

export default function PlantCareGuidePage() {
  return (
    <StoreLayout showFlashDeal={false}>
      <JsonLdScript data={faqJsonLd(FAQS)} />

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
            Plant Care Guide
          </h1>
          <p className="text-urdu mt-3 text-xl text-primary-foreground/90" dir="rtl" lang="ur">
            پودوں کی دیکھ بھال گائیڈ
          </p>
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

        <div className="mt-8 space-y-4">
          {FAQS.map((faq, i) => (
            <details key={i} className="rounded-2xl border bg-card p-5 shadow-sm">
              <summary className="cursor-pointer font-semibold text-foreground">{faq.q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </StoreLayout>
  );
}
