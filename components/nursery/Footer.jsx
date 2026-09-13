"use client";

import Link from "next/link";
import { Camera, Globe, MessageCircle, PlayCircle, ShieldCheck, Facebook, Instagram, Phone } from "lucide-react";
import { IMAGES } from "./data";
import { buildWhatsAppUrl, formatStorePhone, generalSupportMessage } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={IMAGES.logo}
              alt=""
              className="h-12 w-12 rounded-full object-cover ring-2 ring-leaf"
            />
            <div>
              <p className="font-display text-lg font-bold">NOOR NURSERY</p>
              <p className="text-[11px] text-primary-foreground/70">Pakistan&apos;s Living Heritage</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/75">
            Nurturing homes and gardens across Pakistan since 2012. We deliver healthy, hardened
            plants acclimatized for Karachi coastal air, Punjab plains, and Northern hill climates
            directly to your doorstep with guaranteed live arrival.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <a href="https://www.facebook.com/Noor.Nursery.24hr" target="_blank" rel="noopener noreferrer" className="rounded-full bg-primary-foreground/10 p-2 text-primary-foreground transition hover:bg-leaf hover:text-leaf-foreground" aria-label="Facebook">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="https://www.instagram.com/noornursery_official/" target="_blank" rel="noopener noreferrer" className="rounded-full bg-primary-foreground/10 p-2 text-primary-foreground transition hover:bg-leaf hover:text-leaf-foreground" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={`tel:+${formatStorePhone().replace(/\D/g, "")}`} className="rounded-full bg-primary-foreground/10 p-2 text-primary-foreground transition hover:bg-leaf hover:text-leaf-foreground" aria-label="Phone">
              <Phone className="h-4 w-4" />
            </a>
            <a
              href={buildWhatsAppUrl(generalSupportMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary-foreground/10 p-2 text-primary-foreground transition hover:bg-leaf hover:text-leaf-foreground"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-widest text-gold">
            Shop
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/80">
            {[
              { href: "/shop", label: "All Plants" },
              { href: "/shop?category=indoor-plants", label: "Indoor Plants" },
              { href: "/shop?category=flowering-plants", label: "Flowering Plants" },
              { href: "/categories", label: "All Categories" },
              { href: "/shop?featured=true", label: "Featured Plants" },
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
              { href: "/shipping-policy", label: "Express Courier Packaging" },
              { href: "/shipping-policy", label: "Delivery Information" },
              { href: "/faq", label: "Plant Care FAQ" },
              { href: "/track-order", label: "Track Your Order" },
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
              { href: "/faq", label: "FAQ" },
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
              Cash on Delivery (COD) • JazzCash • EasyPaisa • Bank Transfer • PayFast
            </span>
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-forest pt-4 text-xs text-primary-foreground/60">
            <p>© {new Date().getFullYear()} Noor Nursery Pakistan. All rights reserved.</p>
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
