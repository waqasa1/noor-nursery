"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Heart, Menu, MessageCircle, Phone, Search, ShoppingBag, Truck, User, X, Zap } from "lucide-react";
import { IMAGES } from "./data";
import { buildWhatsAppUrl, formatStorePhone, generalSupportMessage } from "@/lib/whatsapp";

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
          <a href={`tel:+${formatStorePhone().replace(/\D/g, "")}`} className="flex items-center gap-1.5 hover:text-leaf">
            <Phone className="h-3.5 w-3.5" /> {formatStorePhone()}
          </a>
          <a
            href={buildWhatsAppUrl(generalSupportMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 hover:text-leaf sm:flex"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function NavigationLinks({ navLinks, setMenuOpen }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

  return (
    <>
      {navLinks.map((link) => {
        const isActive = currentPath === link.href || (link.href === "/shop" && currentPath.startsWith("/shop") && !searchParams.toString());
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen && setMenuOpen(false)}
            className={`shrink-0 whitespace-nowrap px-3 py-2.5 text-[13px] font-medium transition ${
              isActive
                ? "border-b-2 border-secondary font-semibold text-secondary"
                : "text-foreground hover:text-secondary"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

function MobileNavigationLinks({ navLinks, setMenuOpen }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

  return (
    <>
      {navLinks.map((link) => {
        const isActive = currentPath === link.href || (link.href === "/shop" && currentPath.startsWith("/shop") && !searchParams.toString());
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen && setMenuOpen(false)}
            className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-surface-low text-secondary font-semibold"
                : "text-foreground hover:bg-surface-low hover:text-secondary"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}


export function Header({ cartCount = 0, cartTotal = "PKR 0" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const navLinks = [
    { href: "/shop", label: "All Plants" },
    { href: "/shop?category=indoor-plants", label: "Indoor Plants" },
    { href: "/shop?category=outdoor-plants", label: "Outdoor Plants" },
    { href: "/shop?category=flowering-plants", label: "Flowering" },
    { href: "/shop?category=herbs", label: "Herbs" },
    { href: "/categories", label: "Categories" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "Plant Care Guide" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
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
        </Link>

        <form onSubmit={handleSearch} className="ml-2 hidden flex-1 items-center gap-2 lg:flex">
          <div className="flex flex-1 items-center gap-2 rounded-full border bg-surface-low px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search plants, seeds, pots..."
              aria-label="Search plants"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/account"
            className="hidden items-center gap-2 rounded-full border border-primary bg-card px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-surface-low sm:flex"
            aria-label="Account"
          >
            <User className="h-4 w-4" />
            Account
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-forest"
            aria-label={`Cart, ${cartCount} items`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden sm:inline">{cartTotal}</span>
            <span className="rounded-full bg-leaf px-2 py-0.5 text-xs font-bold text-leaf-foreground">
              {cartCount} items
            </span>
          </Link>
          <button
            type="button"
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
            <form onSubmit={handleSearch} className="mb-3">
              <div className="flex items-center gap-2 rounded-full border bg-surface-low px-4 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Search plants..."
                  aria-label="Search plants"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
              onClick={() => setMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              Login / Create Account
            </Link>
            <nav className="mt-3 grid gap-1" aria-label="Mobile navigation">
              <Suspense fallback={null}>
                <MobileNavigationLinks navLinks={navLinks} setMenuOpen={setMenuOpen} />
              </Suspense>
            </nav>
          </div>
        </div>
      )}

      <nav className="hidden border-t bg-surface-low lg:block" aria-label="Main navigation">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4">
          <Suspense fallback={null}>
            <NavigationLinks navLinks={navLinks} />
          </Suspense>
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
