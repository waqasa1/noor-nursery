"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Banknote,
  MessageCircle,
  Package,
  Sprout,
  ThumbsUp,
} from "lucide-react";
import { CATEGORIES, IMAGES } from "./data";
import { BRAND } from "@/lib/brand";
import { buildPlantDoctorWhatsAppUrl } from "@/lib/whatsapp";

export function Hero() {
  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={IMAGES.hero}
          alt="A sunlit terrace filled with lush indoor plants including palms, monstera, and hanging greenery"
          className="animate-hero-zoom h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/92 via-primary/75 to-primary/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 py-16 lg:py-24">
        <p className="animate-fade-up inline-flex max-w-fit items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-leaf backdrop-blur-sm">
          <BadgeCheck className="h-4 w-4" />
          {BRAND.sloganPrimary}
        </p>

        <h1 className="animate-fade-up-delay-1 mt-6 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
          Bring Nature Into Your Life.
        </h1>

        <p className="animate-fade-up-delay-2 mt-5 max-w-xl text-lg font-medium text-leaf sm:text-xl">
          {BRAND.sloganSecondary}
        </p>

        <p className="animate-fade-up-delay-2 mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
          Discover beautiful, healthy plants carefully selected for your home, garden, and
          workspace — acclimatized for Pakistan and delivered with care nationwide.
        </p>

        <p className="text-urdu animate-fade-up-delay-2 mt-3 text-lg text-primary-foreground/75" dir="rtl" lang="ur">
          پاکستان کی سب سے بڑی آن لائن نرسری
        </p>

        <div className="animate-fade-up-delay-3 mt-8 flex flex-wrap gap-3">
          <a
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-leaf px-7 py-3.5 font-semibold text-leaf-foreground shadow-lg transition hover:bg-gold hover:text-gold-foreground"
          >
            <Sprout className="h-5 w-5" />
            Explore Our Collection
          </a>
          <a
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary-foreground/30 bg-primary-foreground/10 px-7 py-3.5 font-semibold text-primary-foreground backdrop-blur-sm transition hover:bg-primary-foreground/20"
          >
            Discover Your Perfect Plant
          </a>
          <a
            href={buildPlantDoctorWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary-foreground/20 px-7 py-3.5 font-semibold text-primary-foreground/90 transition hover:bg-primary-foreground/10"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp Plant Doctor
          </a>
        </div>

        <div className="animate-fade-up-delay-3 mt-10 grid max-w-lg grid-cols-3 gap-3">
          {[
            { value: "300+", label: "Live Species" },
            { value: "48-Hr", label: "Arrival Guarantee" },
            { value: "2012", label: "Trusted Since" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-3 text-center backdrop-blur-sm"
            >
              <p className="font-display text-xl font-bold text-leaf sm:text-2xl">{s.value}</p>
              <p className="mt-0.5 text-[11px] font-medium leading-tight text-primary-foreground/70">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative border-t border-primary-foreground/10 bg-primary/95 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 lg:grid-cols-4">
          {[
            {
              icon: Package,
              title: "Secure Packaging",
              urdu: "پودوں کی بحفاظت ترسیل",
              sub: "Shockproof transit containers",
            },
            {
              icon: ThumbsUp,
              title: "48-Hr Live Guarantee",
              urdu: "زندہ پہنچنے کی ضمانت",
              sub: "Free replacement if wilted",
            },
            {
              icon: Sprout,
              title: "Plant Care Support",
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
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-leaf/20">
                <f.icon className="h-5 w-5 text-leaf" />
              </span>
              <div>
                <p className="text-sm font-bold text-primary-foreground">{f.title}</p>
                <p className="text-urdu text-xs text-leaf/80" dir="rtl" lang="ur">
                  {f.urdu}
                </p>
                <p className="text-xs text-primary-foreground/65">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Categories({ categories = [] }) {
  const list = categories.length
    ? categories
    : CATEGORIES.map((c) => ({
        slug: c.name.toLowerCase().replace(/\s+/g, "-"),
        nameEn: c.name,
        nameUr: c.urdu,
        image: c.image,
      }));

  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-16">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary">
          Shop by Category
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Find the perfect plants for every space
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Hand-picked varieties for home, terrace, and lawn — browse with confidence.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {list.slice(0, 5).map((c) => (
          <a
            key={c.slug || c.nameEn}
            href={c.slug ? `/categories/${c.slug}` : "#plants"}
            className="group relative aspect-[3/4] overflow-hidden rounded-3xl shadow-md transition duration-500 hover:-translate-y-1 hover:shadow-xl"
          >
            <img
              src={c.image || "/placeholder.jpg"}
              alt={c.nameEn}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent transition duration-500 group-hover:from-primary/95" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="font-display text-base font-bold text-primary-foreground sm:text-lg">
                {c.nameEn}
              </p>
              <p
                className="text-urdu mt-0.5 text-xs text-primary-foreground/75 opacity-0 transition duration-300 group-hover:opacity-100"
                dir="rtl"
                lang="ur"
              >
                {c.nameUr}
              </p>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-secondary transition hover:text-primary"
        >
          View All Categories →
        </Link>
      </div>
    </section>
  );
}
