"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, ShieldCheck, Facebook, Instagram, MapPin, Phone } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { buildWhatsAppUrl, formatStorePhone, generalSupportMessage, normalizeWhatsAppPhone } from "@/lib/whatsapp";
import { useSiteSettings } from "@/lib/useSiteSettings";

export function Footer() {
  const settings = useSiteSettings();
  const sc = settings.site_content;
  const storePhone = settings.store?.phone || "";

  const displayPhone = formatStorePhone(storePhone || undefined);
  const telHref = `tel:+${normalizeWhatsAppPhone(storePhone || undefined)}`;
  const waHref = buildWhatsAppUrl(generalSupportMessage());

  const facebookUrl = sc.facebookUrl || "https://www.facebook.com/Noor.Nursery.24hr";
  const instagramUrl = sc.instagramUrl || "https://www.instagram.com/noornursery_official/";
  const copyrightText = sc.copyrightText || "Noor Nursery Pakistan. All rights reserved.";

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-leaf"
            />
            <div>
              <p className="font-display text-lg font-bold">NOOR NURSERY</p>
              <p className="text-[11px] text-primary-foreground/70">{BRAND.tagline}</p>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium leading-relaxed text-leaf">
            {BRAND.sloganSecondary}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/75">
            Nurturing homes and gardens across Pakistan since {BRAND.since}. Healthy, acclimatized
            plants delivered to your doorstep with guaranteed live arrival.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-primary-foreground/10 p-2 text-primary-foreground transition hover:bg-leaf hover:text-leaf-foreground" aria-label="Facebook">
              <Facebook className="h-4 w-4" />
            </a>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-primary-foreground/10 p-2 text-primary-foreground transition hover:bg-leaf hover:text-leaf-foreground" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={telHref} className="rounded-full bg-primary-foreground/10 p-2 text-primary-foreground transition hover:bg-leaf hover:text-leaf-foreground" aria-label="Phone">
              <Phone className="h-4 w-4" />
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary-foreground/10 p-2 text-primary-foreground transition hover:bg-leaf hover:text-leaf-foreground"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
          <a
            href={BRAND.mainOffice.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-start gap-2.5 text-sm leading-relaxed text-primary-foreground/75 transition hover:text-leaf"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-leaf" aria-hidden />
            <span>
              <span className="block font-semibold text-primary-foreground/90">
                {BRAND.mainOffice.label}
              </span>
              {BRAND.mainOffice.address}
            </span>
          </a>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-widest text-gold">
            Shop
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/80">
            {[
              { href: "/shop", label: "All Products" },
              { href: "/shop?category=indoor-plants", label: "Indoor Plants" },
              { href: "/shop?category=flowering-plants", label: "Flowering Plants" },
              { href: "/shop?type=plants", label: "All Plants" },
              { href: "/categories", label: "All Categories" },
              { href: "/shop?featured=true&type=plants", label: "Featured Plants" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-leaf">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-widest text-gold">
            Care &amp; Delivery
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/80">
            {[
              { href: "/shipping-policy", label: "48-Hour Live Plant Guarantee" },
              { href: "/shipping-policy", label: "Delivery Information" },
              { href: "/faq#plant-finder", label: "Plant Finder" },
              { href: "/track-order", label: "Order status" },
            ].map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-leaf">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-widest text-gold">
            Company
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/80">
            {[
              { href: "/about", label: "About Us" },
              { href: "/contact", label: "Contact" },
              { href: "/faq#faq", label: "FAQ" },
              { href: "/privacy-policy", label: "Privacy Policy" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-leaf">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-forest">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-primary-foreground/85">
            <ShieldCheck className="h-4 w-4 text-leaf" />
            Safe Payments Across Pakistan:
            <span className="font-normal text-primary-foreground/70">
              Cash on Delivery (COD) • JazzCash
            </span>
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-forest pt-4 text-xs text-primary-foreground/60">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>© {new Date().getFullYear()} {copyrightText}</span>
              <span className="text-primary-foreground/35" aria-hidden>
                ·
              </span>
              <span>
                Created by{" "}
                <a
                  href="https://www.marsweb.tech/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/75 underline-offset-2 hover:text-leaf hover:underline"
                >
                  Mars Web
                </a>
              </span>
            </p>
            <div className="flex gap-4">
              <Link href="/privacy-policy" className="hover:text-leaf">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-leaf">Terms of Service</Link>
              <Link href="/return-policy" className="hover:text-leaf">Return Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
