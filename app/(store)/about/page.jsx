import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Leaf, MapPin, Package, Sprout, Truck } from "lucide-react";
import { ContentCtaLink, ContentHero } from "@/components/content/ContentHero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { BRAND } from "@/lib/brand";
import { CATALOG_SPECIES_COUNT } from "@/lib/catalog/copy";
import { IMAGES } from "@/components/nursery/data";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "About Us",
  description: `${BRAND.sloganPrimary} Pakistan's trusted nursery since ${BRAND.since} — fruit plants, quality stock, and six Karachi branches.`,
  path: "/about",
});

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

const STORY = [
  {
    era: "01",
    heading: "The beginning — Mr. Noor Ali Visani",
    body: `Our journey began in ${BRAND.since} with one man's passion. Our grandfather, Mr. Noor Ali Visani, started this nursery not just as a business, but as a hobby that lived in his heart. His vision was simple: "Everyone is doing nursery business, but no one has all the varieties."`,
  },
  {
    era: "02",
    heading: "Collecting every variety",
    body: "Even with a small space, he started collecting every variety he could find. Some survived, some didn't. We faced heavy losses because many plants could not survive in Karachi's climate. But he never gave up.",
  },
  {
    era: "03",
    heading: "Fruit plants — our specialty",
    body: "He noticed that people in Karachi have a deep love for fruits. So he introduced our specialty: all varieties of fruit plants. He searched the whole of Pakistan to bring the best fruit varieties to one place. Customers became family, and a name built on trust was born.",
  },
  {
    era: "04",
    heading: "Second generation — Mr. Mohammad Hanif Noor Ali Visani",
    body: "Then came the second generation — our father, Mr. Mohammad Hanif Noor Ali Visani. He focused on quality and quantity, improved sizes, and studied which plant grows best in which area. To overcome the challenge of space, he expanded from one nursery to two, two to three, and today, Alhamdulillah, we have 6 branches across Karachi with our own separate farms.",
  },
  {
    era: "05",
    heading: "Third generation — Mr. Alishan Mohammad Hanif",
    body: "Then came the third generation — Mr. Alishan Mohammad Hanif. He took the business online through our website, YouTube, Instagram, and Facebook, and brought innovation: grafted and air-layered plants that fruit and flower faster.",
  },
  {
    era: "06",
    heading: "You — our customers",
    body: "And the most important part of our growth has been you — our customers. We listened to every customer complaint, every difficulty, every feedback. We never saw a complaint as a failure. We saw it as a lesson. That improvement built trust, and that trust turned into a beautiful family bond. We learned from our customers, and our customers learned from us.",
  },
];

export default function AboutPage() {
  return (
    <>
      <ContentHero
        title="From a Hobby to an Empire Built on Trust"
        titleUr="نور نرسری کے بارے میں"
        lead={`${BRAND.sloganPrimary} ${BRAND.sloganSecondary}`}
        actions={
          <>
            <ContentCtaLink href="#our-story">Read our story</ContentCtaLink>
            <ContentCtaLink href="/shop" variant="ghost">
              Shop plants
            </ContentCtaLink>
          </>
        }
      />

      {/* Story first — not buried below intro + image */}
      <section
        id="our-story"
        className="scroll-mt-24 relative overflow-hidden bg-[linear-gradient(165deg,var(--surface-low)_0%,var(--background)_45%,var(--surface-mid)_100%)]"
      >
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:px-6 lg:py-20">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-secondary">
              Our story
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Growing Spaces. Creating Connections.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-foreground/80">
              Today, what started as a small hobby in {BRAND.since} has become an empire, known
              across Pakistan for the largest quantity and the finest quality.
            </p>
            <p className="mt-3 text-sm font-medium text-secondary">{BRAND.sloganPrimary}</p>
            <p className="text-urdu mt-4 text-lg text-secondary" dir="rtl" lang="ur">
              ۱۹۶۵ سے پاکستان بھر میں گھروں اور باغات کو سرسبز بناتے ہوئے۔
            </p>

            <div className="relative mt-8 overflow-hidden rounded-[1.75rem] shadow-[0_24px_60px_-28px_rgba(20,60,40,0.45)]">
              <div className="relative aspect-[5/4] w-full lg:aspect-[4/5]">
                <Image
                  src={IMAGES.indoor}
                  alt="Lush indoor plants arranged in a bright living space"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent p-6 pt-24">
                <p className="flex items-center gap-2 text-sm font-semibold text-primary-foreground">
                  <BadgeCheck className="h-4 w-4 text-leaf" />
                  Trusted since {BRAND.since}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 text-sm text-foreground/80">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
              <div>
                <p>
                  <strong className="text-foreground">{BRAND.mainOffice.label}</strong> —{" "}
                  {BRAND.mainOffice.address}
                </p>
                <p className="mt-2 text-muted-foreground">
                  6 branches and our own farms across Karachi. We fulfil orders online; message us
                  on WhatsApp for wholesale or pickup.
                </p>
                <a
                  href={BRAND.mainOffice.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex text-sm font-bold text-secondary hover:text-primary"
                >
                  View on Google Maps →
                </a>
              </div>
            </div>
          </Reveal>

          <Stagger className="relative space-y-0 border-l border-secondary/30 pl-6 sm:pl-8" stagger={0.1}>
            {STORY.map((block) => (
              <StaggerItem key={block.era} className="relative pb-10 last:pb-2">
                <span
                  className="absolute -left-[1.55rem] top-1 grid h-7 w-7 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground sm:-left-[2.05rem]"
                  aria-hidden
                >
                  {block.era}
                </span>
                <h3 className="font-display text-xl font-bold text-primary sm:text-2xl">
                  {block.heading}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-foreground/80">{block.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="border-y border-border/60 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-leaf">Why choose us</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {BRAND.sloganSecondary}
            </h2>
            <p className="mt-3 text-primary-foreground/75">
              One mission: quality plants, honest delivery, and help when you need it — three
              generations of learning, shaped by your feedback.
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
                  <p className="mt-1.5 text-sm leading-relaxed text-primary-foreground/75">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-6 lg:py-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-[linear-gradient(120deg,var(--surface-mid),var(--surface-low)_55%,transparent)] px-6 py-10 sm:flex-row sm:items-center sm:px-10">
          <div>
            <h2 className="font-display text-2xl font-bold text-primary sm:text-3xl">
              Your Space Deserves Something Alive.
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {BRAND.sloganPrimary}
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
