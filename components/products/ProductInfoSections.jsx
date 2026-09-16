"use client";

import { useState } from "react";
import { ChevronDown, Droplets, HelpCircle, Leaf, List, Sparkles, Sun } from "lucide-react";
import {
  buildCareGuide,
  buildProductFaqs,
  buildQuickFacts,
  buildSpecifications,
  extractBotanicalName,
} from "@/lib/products/product-detail-content";

function AccordionSection({ id, title, icon: Icon, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <button
        type="button"
        id={`${id}-trigger`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-surface-low/60"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-low">
            <Icon className="h-4 w-4 text-secondary" />
          </span>
          <span className="font-display text-base font-bold text-foreground sm:text-lg">{title}</span>
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-secondary transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-trigger`} className="border-t px-5 py-5">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductInfoSections({ product, variant }) {
  const botanical = extractBotanicalName(product);
  const quickFacts = buildQuickFacts(product);
  const specifications = buildSpecifications(product, variant);
  const careGuide = buildCareGuide(product);
  const faqs = buildProductFaqs(product);

  const hasCareInstructions = Boolean(product.careInstructionsEn || product.careInstructionsUr);
  const hasDescription = Boolean(product.descriptionEn || product.descriptionUr);

  return (
    <div className="mt-14 space-y-4">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-primary sm:text-3xl">
          Product Information
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you need to know about {product.nameEn}
          {botanical ? ` (${botanical})` : ""}
        </p>
      </div>

      <AccordionSection id="in-short" title="In Short" icon={Sparkles} defaultOpen>
        <div className="grid gap-3 sm:grid-cols-2">
          {quickFacts.map((fact) => (
            <div key={fact.label} className="rounded-xl bg-surface-low px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {fact.label}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">{fact.value}</p>
            </div>
          ))}
        </div>
        {product.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </AccordionSection>

      <AccordionSection id="specifications" title="Product Details & Specifications" icon={List}>
        <dl className="divide-y">
          {specifications.map((spec) => (
            <div key={spec.label} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
              <dt className="text-sm font-semibold text-muted-foreground">{spec.label}</dt>
              <dd className="text-sm text-foreground">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </AccordionSection>

      {careGuide.length > 0 && (
        <AccordionSection id="care-guide" title="Plant Care Guide" icon={Sun} defaultOpen>
          <div className="grid gap-4 md:grid-cols-2">
            {careGuide.map((item) => (
              <div key={item.title} className="rounded-xl border bg-surface-low/50 p-4">
                <div className="flex items-center gap-2">
                  {item.title === "Sunlight" && <Sun className="h-4 w-4 text-gold" />}
                  {item.title === "Watering" && <Droplets className="h-4 w-4 text-secondary" />}
                  {item.title !== "Sunlight" && item.title !== "Watering" && (
                    <Leaf className="h-4 w-4 text-secondary" />
                  )}
                  <h3 className="font-display text-sm font-bold text-foreground">{item.title}</h3>
                </div>
                <p className="mt-2 text-sm font-medium text-secondary">{item.value}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.tip}</p>
              </div>
            ))}
          </div>
        </AccordionSection>
      )}

      {hasCareInstructions && (
        <AccordionSection id="care-instructions" title="Care Instructions" icon={Leaf}>
          {product.careInstructionsEn && (
            <p className="text-sm leading-relaxed text-muted-foreground">{product.careInstructionsEn}</p>
          )}
          {product.careInstructionsUr && (
            <p className="text-urdu mt-3 text-sm leading-relaxed text-muted-foreground" dir="rtl" lang="ur">
              {product.careInstructionsUr}
            </p>
          )}
        </AccordionSection>
      )}

      {hasDescription && (
        <AccordionSection id="more-details" title="More Details" icon={List}>
          {product.descriptionEn && (
            <p className="text-sm leading-relaxed text-muted-foreground">{product.descriptionEn}</p>
          )}
          {product.descriptionUr && (
            <p className="text-urdu mt-3 text-sm leading-relaxed text-muted-foreground" dir="rtl" lang="ur">
              {product.descriptionUr}
            </p>
          )}
        </AccordionSection>
      )}

      <AccordionSection id="faq" title={`${product.nameEn} FAQ`} icon={HelpCircle}>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="group rounded-xl border bg-surface-low/40 px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-3">
                  {faq.q}
                  <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-secondary transition group-open:rotate-180" />
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </AccordionSection>
    </div>
  );
}
