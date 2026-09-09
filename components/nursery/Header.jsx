"use client";

import { useState } from "react";
import { Heart, Menu, MessageCircle, Phone, Search, ShoppingBag, Truck, User, X, Zap } from "lucide-react";
import { IMAGES, NAV_LINKS } from "./data";

export function TopBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:text-sm">
        <p className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-leaf" />
          <span>
            Same-day &amp; Express delivery across Lahore, Karachi, Islamabad &amp; 50+ cities across
            Pakistan
          </span>
          <span className="hidden font-semibold text-gold md:inline">| Free Shipping over PKR 2,500</span>
        </p>
        <div className="flex items-center gap-4">
          <a href="tel:03001234567" className="flex items-center gap-1.5 hover:text-leaf">
            <Phone className="h-3.5 w-3.5" /> 0300-1234567
          </a>
          <a href="#faq" className="hidden items-center gap-1.5 hover:text-leaf sm:flex">
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Help
          </a>
        </div>
      </div>
    </div>
  );
}

export function Header({ cartCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <a href="#" className="flex items-center gap-3">
          <img
            src={IMAGES.logo}
            alt="Noor Nursery Official Insignia"
            className="h-12 w-12 rounded-full object-cover ring-2 ring-leaf"
          />
          <div>
            <p className="font-display text-lg font-bold leading-tight tracking-tight text-primary">
              NOOR NURSERY
            </p>
            <p className="text-[11px] font-medium text-muted-foreground">
              Pakistan&apos;s Living Heritage
            </p>
          </div>
        </a>

        <div className="ml-2 hidden flex-1 items-center gap-2 lg:flex">
          <div className="flex flex-1 items-center gap-2 rounded-full border bg-surface-low px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search 300+ plants, seeds, pots..."
              aria-label="Search plants"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="relative hidden rounded-full border bg-surface-low p-2.5 text-foreground transition hover:bg-surface-mid sm:block"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gold text-[10px] font-bold text-gold-foreground">
              3
            </span>
          </button>
          <button
            className="hidden items-center gap-2 rounded-full border border-primary bg-card px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-surface-low sm:flex"
            aria-label="Login"
          >
            <User className="h-4 w-4" />
            Login
          </button>
          <button
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-forest"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden sm:inline">PKR 0.00</span>
            <span className="rounded-full bg-leaf px-2 py-0.5 text-xs font-bold text-leaf-foreground">
              {cartCount} items
            </span>
          </button>
          <button
            className="rounded-full border bg-surface-low p-2.5 text-foreground transition hover:bg-surface-mid lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t bg-card lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <button className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-forest">
              <User className="h-4 w-4" />
              Login / Create Account
            </button>
            <nav className="mt-3 grid gap-1" aria-label="Mobile categories">
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href="#plants"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-low hover:text-secondary"
                >
                  {link}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2 text-sm">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Quick:
          </span>
          {["Indoor Plants", "Fruit Trees", "Herbs", "Snake Plant", "Fertilizer"].map((q, i, arr) => (
            <span key={q} className="flex shrink-0 items-center gap-2">
              <a href="#plants" className="font-medium text-foreground hover:text-secondary">
                {q}
              </a>
              {i < arr.length - 1 && <span className="text-outline-var">•</span>}
            </span>
          ))}
        </div>
      </div>

      <nav className="hidden border-t bg-surface-low lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link}
              href="#plants"
              className={`shrink-0 whitespace-nowrap px-3 py-2.5 text-[13px] font-medium transition ${
                i === 0
                  ? "border-b-2 border-secondary font-semibold text-secondary"
                  : "text-foreground hover:text-secondary"
              }`}
            >
              {link}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}

export function FlashDeal() {
  return (
    <div className="bg-gold text-gold-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center text-sm">
        <Zap className="h-4 w-4" />
        <span className="font-bold">Special Spring Flash Deal:</span>
        <span>
          Flat 20% OFF on all Fruit Trees + Free Potting Mix on orders over PKR 2,999!
        </span>
        <span className="rounded-md bg-primary px-2 py-0.5 font-mono text-xs font-bold text-gold">
          Code: NOOR20
        </span>
      </div>
    </div>
  );
}
