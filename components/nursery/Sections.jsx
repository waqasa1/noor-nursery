"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  HeartHandshake,
  Headphones,
  Package,
  ShieldCheck,
  Sprout,
  Star,
  Sun,
  SunDim,
  SunMedium,
  Truck,
} from "lucide-react";
import { IMAGES } from "./data";
import { BRAND } from "@/lib/brand";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Carousel, CarouselItem } from "@/components/motion/Carousel";
import { useFeaturedReveal } from "@/components/motion/useFeaturedReveal";

export function FeaturedPlant() {
  const settings = useSiteSettings();
  const indoorImageSrc = settings.site_content?.indoorImage || IMAGES.indoor;
  const rootRef = useRef(null);
  useFeaturedReveal(rootRef);

  return (
    <section ref={rootRef} className="overflow-x-clip bg-card py-16">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2">
        <div className="relative order-2 overflow-hidden lg:order-1">
          <div
            data-featured-media
            className="overflow-hidden rounded-3xl shadow-2xl will-change-transform"
          >
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={indoorImageSrc}
                alt="Lush indoor plant collection featuring monstera and tropical foliage"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
        <div data-featured-copy className="order-1 lg:order-2">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Plant of the Season
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            The Indoor Collection
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Beautiful. Bold. Naturally Elegant.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Transform your living spaces with carefully selected indoor plants — air-purifying,
            low-maintenance, and ready to thrive in Pakistani homes.
          </p>
          <Link
            href="/shop?category=indoor-plants"
            className="mt-8 inline-flex rounded-full bg-secondary px-8 py-3.5 text-sm font-bold text-secondary-foreground transition hover:bg-primary"
          >
            Explore Collection
          </Link>
        </div>
      </div>
    </section>
  );
}

export function PlantCareFinder() {
  const options = [
    {
      icon: SunDim,
      label: "Low Light",
      href: "/shop?category=indoor-plants",
      desc: "Shaded corners & offices",
    },
    {
      icon: SunMedium,
      label: "Medium Light",
      href: "/shop?category=indoor-plants",
      desc: "Bright rooms, indirect sun",
    },
    {
      icon: Sun,
      label: "Bright Light",
      href: "/shop?category=fruit-plants",
      desc: "Balconies & open gardens",
    },
  ];

  return (
    <section className="bg-surface-low py-16">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">Plant Care</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Find the Right Plant for Your Space
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            How much sunlight do you have? Start here.
          </p>
        </Reveal>
        <Stagger className="mt-8 grid gap-4 sm:grid-cols-3" stagger={0.1}>
          {options.map((o) => (
            <StaggerItem key={o.label}>
              <Link
                href="/faq#plant-finder"
                className="group block rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-secondary hover:shadow-lg"
              >
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-surface-low transition group-hover:bg-secondary group-hover:text-secondary-foreground">
                  <o.icon className="h-6 w-6 text-secondary group-hover:text-secondary-foreground" />
                </span>
                <p className="mt-4 font-display text-base font-bold text-foreground">{o.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{o.desc}</p>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal className="mt-8 text-center" delay={0.15}>
          <Link
            href="/faq#plant-finder"
            className="inline-flex rounded-full bg-secondary px-8 py-3 text-sm font-bold text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground"
          >
            Take the Full Plant Finder Quiz →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function BrandStory() {
  const settings = useSiteSettings();
  const aboutImageSrc = settings.site_content?.aboutImage || IMAGES.fruitTrees;
  return (
    <section className="mx-auto max-w-7xl overflow-x-clip px-4 py-16">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">About Us</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Growing Spaces. Creating Connections.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            At Noor Nursery, we believe plants do more than decorate a space. They bring life, calm,
            and natural beauty into everyday environments — from Karachi balconies to Lahore lawns.
          </p>
          <p className="mt-3 text-sm font-medium text-secondary">{BRAND.sloganPrimary}</p>
          <Link
            href="/about"
            className="mt-6 inline-flex text-sm font-bold text-secondary hover:text-primary"
          >
            Read Our Story →
          </Link>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-xl">
            <Image
              src={aboutImageSrc}
              alt="Noor Nursery garden with fruit trees and flowering plants"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCTA() {
  const settings = useSiteSettings();
  const ctaImage =
    settings.site_content?.aboutImage ||
    settings.site_content?.heroImage ||
    IMAGES.flowering;

  return (
    <section className="relative overflow-hidden bg-primary py-20 text-center text-primary-foreground">
      <div className="absolute inset-0 opacity-20">
        <Image
          src={ctaImage}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/90 to-primary/80" />
      <Reveal className="relative mx-auto max-w-2xl px-4">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          Your Space Deserves Something Alive.
        </h2>
        <p className="mt-4 text-primary-foreground/85">{BRAND.sloganSecondary}</p>
        <p className="mt-3 text-sm text-primary-foreground/70">
          Discover plants that bring natural beauty into your everyday life.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex rounded-full bg-leaf px-10 py-3.5 text-sm font-bold text-leaf-foreground transition hover:bg-gold hover:text-gold-foreground"
        >
          Explore Our Collection
        </Link>
      </Reveal>
    </section>
  );
}

export function Trust() {
  const items = [
    {
      icon: Sprout,
      title: "Healthy & Carefully Selected",
      body: "Every plant is inspected and conditioned before delivery — no unrooted cuttings, no surprises.",
      urdu: "صحت مند اور منتخب پودے",
    },
    {
      icon: Package,
      title: "Secure Packaging",
      body: "Shock-proof ventilation crates keep your plants safe during 24–48 hour courier travel.",
      urdu: "محفوظ پیکیجنگ",
    },
    {
      icon: Truck,
      title: "Reliable Delivery",
      body: "Nationwide delivery across 50+ cities with Cash on Delivery and live arrival guarantee.",
      urdu: "قابل اعتماد ترسیل",
    },
    {
      icon: Headphones,
      title: "Plant Care Support",
      body: "WhatsApp guidance from trained horticulturists — before and after your purchase.",
      urdu: "پودوں کی دیکھ بھال میں مدد",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <Reveal className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary">
          Why Noor Nursery
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          {BRAND.tagline.charAt(0).toUpperCase() + BRAND.tagline.slice(1)}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {BRAND.sloganSecondary}
        </p>
      </Reveal>

      <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
        {items.map((i) => (
          <StaggerItem key={i.title}>
            <div className="h-full rounded-2xl border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-low">
                <i.icon className="h-6 w-6 text-secondary" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">{i.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{i.body}</p>
              <p className="text-urdu mt-3 text-sm text-secondary" dir="rtl" lang="ur">
                {i.urdu}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export function Testimonials() {
  const settings = useSiteSettings();
  const testimonials = settings.testimonials || [];

  if (testimonials.length === 0) return null;

  return (
    <section className="overflow-x-clip bg-primary py-14 text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal className="text-center">
          <div className="flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-gold text-gold" />
            ))}
          </div>
          <p className="mt-2 font-display text-sm font-bold text-gold">Customer Reviews</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            What Plant Lovers Say
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/75">
            Reviews from customers across Pakistan ·{" "}
            <strong className="text-leaf">Shared by real buyers</strong>
          </p>
        </Reveal>

        <Carousel className="mt-9" label="Customer reviews">
          {testimonials.map((t) => (
            <CarouselItem key={t.id || t.name}>
              <figure className="h-full rounded-2xl bg-card p-6 text-card-foreground shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  {t.when ? (
                    <span className="text-xs text-muted-foreground">{t.when}</span>
                  ) : null}
                </div>
                <blockquote
                  className={`mt-3 text-sm leading-relaxed text-foreground ${t.rtl ? "text-urdu" : ""}`}
                  dir={t.rtl ? "rtl" : "ltr"}
                  lang={t.rtl ? "ur" : "en"}
                >
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t pt-4">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    {t.location ? (
                      <p className="text-xs text-muted-foreground">{t.location}</p>
                    ) : null}
                  </div>
                </figcaption>
              </figure>
            </CarouselItem>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState(0);
  const settings = useSiteSettings();
  const faqs = settings.faqs || [];

  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="bg-surface-low py-14">
      <div className="mx-auto max-w-3xl px-4">
        <Reveal className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Help &amp; Answers
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Common queries regarding plant delivery in Pakistan, survivability, and payments
          </p>
        </Reveal>

        <Stagger className="mt-8 space-y-3" stagger={0.1}>
          {faqs.map((f, i) => (
            <StaggerItem key={f.id || f.q}>
              <div className="overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open === i}
                >
                  <span className="font-display text-base font-bold text-foreground">{f.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-secondary transition ${open === i ? "rotate-180" : ""}`}
                  />
                </button>
                {open === i && (
                  <p className="border-t px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </p>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground" delay={0.15}>
          <HeartHandshake className="h-5 w-5 text-secondary" />
          Still unsure? Our horticulturists reply within minutes on +92 349 2849062.
        </Reveal>
      </div>
    </section>
  );
}
