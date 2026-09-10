"use client";

import { useState } from "react";
import {
  ChevronDown,
  HeartHandshake,
  Headphones,
  ShieldCheck,
  Sprout,
  Star,
} from "lucide-react";
import { FAQS, TESTIMONIALS } from "./data";

export function Trust() {
  const items = [
    {
      icon: Sprout,
      title: "Specialized Organic Potting Soil",
      body: "Our custom blend combines aged cow manure, cocopeat, perlite, and river sand. It ensures 100% drainage and prevents root rot during monsoon humid spells.",
      urdu: "خالص نامیاتی مٹی کا مرکب",
    },
    {
      icon: ShieldCheck,
      title: "Shock-Proof Ventilation Crates",
      body: "Specially engineered corrugated honeycomb cylinders that lock the pot in place while leaves breathe freely during 24-48h courier travel across cities.",
      urdu: "جھٹکا محفوظ کوریئر پیکیجنگ",
    },
    {
      icon: Headphones,
      title: "Lifetime Agronomist Support",
      body: "Got yellowing leaves or white flies? Send our University of Agriculture Faisalabad (UAF) trained horticulturists a photo anytime on WhatsApp for treatment advice.",
      urdu: "ماہرین سے مفت مشورہ",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary">
          Horticultural Standard
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Why Pakistani Gardeners Trust Noor Nursery
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Unlike roadside vendors who pot unrooted cuttings in clay silt (bhall), every single Noor
          Nursery plant undergoes strict conditioning:
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {items.map((i) => (
          <div key={i.title} className="rounded-2xl border bg-card p-6 shadow-sm">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-low">
              <i.icon className="h-6 w-6 text-secondary" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-foreground">{i.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{i.body}</p>
            <p className="text-urdu mt-3 text-sm text-secondary" dir="rtl" lang="ur">
              {i.urdu}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="bg-primary py-14 text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <div className="flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-gold text-gold" />
            ))}
          </div>
          <p className="mt-2 font-display text-sm font-bold text-gold">4.9 / 5.0 Rating</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Verified Plant Lover Reviews
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/75">
            Real testimonials from Karachi, Lahore, Islamabad, Faisalabad and beyond ·{" "}
            <strong className="text-leaf">Over 4,800+ 5-Star Reviews Nationwide</strong>
          </p>
        </div>

        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-2xl bg-card p-6 text-card-foreground shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{t.when}</span>
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
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="bg-surface-low py-14">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Help &amp; Answers
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Common queries regarding plant delivery in Pakistan, survivability, and payments
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {FAQS.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
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
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <HeartHandshake className="h-5 w-5 text-secondary" />
          Still unsure? Our horticulturists reply within minutes on +92 349 2849062.
        </div>
      </div>
    </section>
  );
}
