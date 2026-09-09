"use client";

import { Camera, Globe, MessageCircle, PlayCircle, ShieldCheck } from "lucide-react";
import { IMAGES } from "./data";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={IMAGES.logo}
              alt="Noor Nursery logo"
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
          <div className="mt-4 flex gap-2">
            {[Globe, Camera, PlayCircle, MessageCircle].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="grid h-10 w-10 place-items-center rounded-full bg-forest transition hover:bg-secondary"
              >
                <Icon className="h-5 w-5 text-leaf" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-widest text-gold">
            Popular Plants
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/80">
            {[
              "Low Light Indoor Plants",
              "Pakistani Fruit Trees (Chunsa, Kinnow)",
              "Fragrant Jasmine & Motia (موتیا)",
              "Air Purifying Snake & ZZ Plants",
              "Fresh Kitchen Herb Garden",
              "Balcony Starter Combos",
            ].map((l) => (
              <li key={l}>
                <a href="#plants" className="hover:text-leaf">
                  {l}
                </a>
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
              "48-Hour Live Plant Guarantee",
              "Express Courier Packaging",
              "Lahore Same-Day Van Delivery",
              "Seasonal Watering Calendar",
              "AI Leaf Health Scanner",
              "Track Your Shipment",
            ].map((l) => (
              <li key={l}>
                <a href="#faq" className="hover:text-leaf">
                  {l}
                </a>
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
              Cash on Delivery (COD) • JazzCash • EasyPaisa • Direct Bank Transfer (HBL/Meezan) •
              Visa &amp; Mastercard
            </span>
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-forest pt-4 text-xs text-primary-foreground/60">
            <p>
              © 2024 Noor Nursery Pakistan. All rights reserved. Cultivating lush Pakistani spaces
              nationwide.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-leaf">Privacy Policy</a>
              <a href="#" className="hover:text-leaf">Terms of Service</a>
              <a href="#faq" className="hover:text-leaf">Refund Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
