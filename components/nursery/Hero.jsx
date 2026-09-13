"use client";

import {
  BadgeCheck,
  Banknote,
  Leaf,
  MessageCircle,
  Package,
  Sprout,
  ThumbsUp,
} from "lucide-react";
import { CATEGORIES, IMAGES } from "./data";
import { buildPlantDoctorWhatsAppUrl } from "@/lib/whatsapp";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-leaf bg-surface-low px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
            <BadgeCheck className="h-4 w-4" /> Pakistan&apos;s Trusted Nursery Since 2012
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-primary sm:text-5xl lg:text-6xl">
            Lush Green Spaces for Pakistani Homes.
          </h1>
          <p className="text-urdu mt-4 text-xl text-secondary" dir="rtl" lang="ur">
            پاکستان کی سب سے بڑی آن لائن نرسری
          </p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Cultivate your sanctuary with over{" "}
            <strong className="font-semibold text-foreground">300+ acclimated plants</strong> grown in
            our specialized Multan Road Lahore nurseries. Guaranteed pest-free, rooted in rich
            compost, and shipped in shock-resistant crates directly to Lahore, Karachi, Islamabad,
            Peshawar &amp; nationwide.
          </p>

          <div className="mt-7 grid max-w-md grid-cols-3 gap-3">
            {[
              { value: "300+", label: "Live Species (اقسام)" },
              { value: "48-Hr", label: "Arrival Guarantee" },
              { value: "42,000+", label: "Pakistani Gardens" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border bg-card p-3 text-center shadow-sm">
                <p className="font-display text-xl font-bold text-secondary sm:text-2xl">{s.value}</p>
                <p className="mt-0.5 text-[11px] font-medium leading-tight text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#plants"
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-3.5 font-semibold text-secondary-foreground shadow-lg transition hover:bg-primary"
            >
              <Sprout className="h-5 w-5" /> Shop 300+ Plants Now
            </a>
            <a
              href={buildPlantDoctorWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border-2 border-secondary bg-card px-7 py-3.5 font-semibold text-secondary transition hover:bg-surface-low"
            >
              <MessageCircle className="h-5 w-5" /> WhatsApp Plant Doctor
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Leaf className="h-4 w-4 text-secondary" /> Acclimatized Foliage — Tailored for Punjab
              heat &amp; Sindh coastal air
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-secondary" /> 100% Organic
            </span>
            <span className="flex items-center gap-1.5">
              <Package className="h-4 w-4 text-secondary" /> Cushioned Transit Boxes
            </span>
            <span className="flex items-center gap-1.5">
              <Banknote className="h-4 w-4 text-secondary" /> Cash On Delivery (COD)
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-3xl border-4 border-card shadow-2xl">
            <img
              src={IMAGES.hero}
              alt="A sunlit Pakistani modern living room terrace filled with lush indoor plants including an Areca palm, large Monstera deliciosa, and hanging spider plants in terracotta pots"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 left-6 flex items-center gap-3 rounded-2xl border bg-card px-5 py-3.5 shadow-xl">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-leaf">
              <BadgeCheck className="h-6 w-6 text-leaf-foreground" />
            </span>
            <div>
              <p className="font-display text-sm font-bold text-foreground">
                48-Hour Live Plant Guarantee
              </p>
              <p className="text-xs text-muted-foreground">Free replacement if wilted</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-y bg-surface-low">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 lg:grid-cols-4">
          {[
            {
              icon: Package,
              title: "Transit Safe Packing",
              urdu: "پودوں کی بحفاظت ترسیل",
              sub: "Custom shockproof containers",
            },
            {
              icon: ThumbsUp,
              title: "48-Hr Live Guarantee",
              urdu: "زندہ پہنچنے کی ضمانت",
              sub: "Free replacement if wilted",
            },
            {
              icon: Sprout,
              title: "Horticulturist Care",
              urdu: "ماہرین زراعت کی رہنمائی",
              sub: "Free post-purchase guidance",
            },
            {
              icon: Banknote,
              title: "Cash on Delivery",
              urdu: "کیش آن ڈیلیوری سہولت",
              sub: "Pay after checking parcel",
            },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary">
                <f.icon className="h-5 w-5 text-leaf" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">{f.title}</p>
                <p className="text-urdu text-xs text-secondary" dir="rtl" lang="ur">
                  {f.urdu}
                </p>
                <p className="text-xs text-muted-foreground">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Categories({ categories = [] }) {
  const list = categories.length ? categories : CATEGORIES.map((c) => ({
    slug: c.name.toLowerCase().replace(/\s+/g, "-"),
    nameEn: c.name,
    nameUr: c.urdu,
    image: c.image,
  }));

  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Shop by Category / <span lang="ur">پودوں کے زمرے</span>
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Hand-picked varieties classified for easy home, terrace &amp; lawn cultivation
          </h2>
        </div>
        <a
          href="/categories"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-secondary hover:text-primary"
        >
          View All Categories →
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {list.map((c) => (
          <a
            key={c.slug || c.nameEn}
            href={c.slug ? `/categories/${c.slug}` : "#plants"}
            className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={c.image || "/placeholder.jpg"}
                alt={c.nameEn}
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-3 text-center">
              <p className="text-sm font-bold text-foreground">{c.nameEn}</p>
              <p className="text-urdu text-xs text-muted-foreground" dir="rtl" lang="ur">
                {c.nameUr}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
