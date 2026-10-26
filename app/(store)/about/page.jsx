import Link from "next/link";
import { BadgeCheck, Leaf, MapPin, Package, Sprout, Truck } from "lucide-react";
import { ContentCtaLink, ContentHero } from "@/components/content/ContentHero";
import { BRAND } from "@/lib/brand";
import { CATALOG_SPECIES_COUNT } from "@/lib/catalog/copy";
import { IMAGES } from "@/components/nursery/data";

export const metadata = {
  title: "About Us — Noor Nursery",
  description: `${BRAND.sloganPrimary} Pakistan's trusted online nursery since ${BRAND.since}.`,
};

const PILLARS = [
  {
    icon: Sprout,
    title: `${CATALOG_SPECIES_COUNT} varieties`,
    body: "Acclimatized plants chosen for Pakistani homes, terraces, and gardens.",
  },
  {
    icon: Package,
    title: "48-hour live guarantee",
    body: "Shock-resistant packing and a clear replacement promise if something arrives damaged.",
  },
  {
    icon: Truck,
    title: "Nationwide delivery",
    body: "Karachi-based fulfilment, plus COD and JazzCash across 50+ cities.",
  },
  {
    icon: Leaf,
    title: "Care in two languages",
    body: "English and Urdu guidance so every plant has a fair start after delivery.",
  },
];

export default function AboutPage() {
  return (
    <>
      <ContentHero
        title="About Noor Nursery"
        titleUr="نور نرسری کے بارے میں"
        lead={`${BRAND.sloganPrimary} Growing with Pakistani homes and gardens since ${BRAND.since}.`}
        actions={
          <>
            <ContentCtaLink href="/shop">Shop plants</ContentCtaLink>
            <ContentCtaLink href="/contact" variant="ghost">
              Contact us
            </ContentCtaLink>
          </>
        }
      />

      <section className="relative overflow-hidden bg-[linear-gradient(165deg,var(--surface-low)_0%,var(--background)_45%,var(--surface-mid)_100%)]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:gap-16 lg:px-6 lg:py-24">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-secondary">Our story</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              {BRAND.sloganSecondary}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/80">
              Noor Nursery began with a simple idea: healthy, hardened plants should reach every Pakistani
              doorstep without the gamble. We select stock that thrives in Karachi coastal air, Punjab plains,
              and cooler northern climates — then pack it to travel.
            </p>
            <p className="text-urdu mt-4 text-lg text-secondary" dir="rtl" lang="ur">
              ۲۰۱۲ سے پاکستان بھر میں گھروں اور باغات کو سرسبز بناتے ہوئے۔
            </p>
            <div className="mt-8 flex items-start gap-3 text-sm text-foreground/80">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
              <p>
                Based in <strong className="text-foreground">{BRAND.city}</strong>. We fulfil orders online —
                message us on WhatsApp for wholesale or pickup arrangements.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-leaf/25 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[1.75rem] shadow-[0_24px_60px_-28px_rgba(20,60,40,0.45)]">
              <img
                src={IMAGES.indoor}
                alt="Lush indoor plants arranged in a bright living space"
                className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent p-6 pt-24">
                <p className="flex items-center gap-2 text-sm font-semibold text-primary-foreground">
                  <BadgeCheck className="h-4 w-4 text-leaf" />
                  Trusted since {BRAND.since}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-leaf">Why choose us</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Built for Pakistani plant lovers
            </h2>
            <p className="mt-3 text-primary-foreground/75">
              One mission: quality plants, honest delivery, and help when you need it.
            </p>
          </div>

          <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {PILLARS.map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-leaf/20 text-leaf">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-primary-foreground/75">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-6 lg:py-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-[linear-gradient(120deg,var(--surface-mid),var(--surface-low)_55%,transparent)] px-6 py-10 sm:flex-row sm:items-center sm:px-10">
          <div>
            <h2 className="font-display text-2xl font-bold text-primary sm:text-3xl">Ready to grow with us?</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Browse the catalog, or ask our team about bulk orders and plant care.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-forest"
            >
              Explore the shop
            </Link>
            <Link
              href="/faq#plant-finder"
              className="inline-flex rounded-full border border-primary/25 bg-card px-6 py-3 text-sm font-bold text-primary transition hover:bg-surface-low"
            >
              Plant Finder
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
