"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Heart, Menu, MessageCircle, Phone, Search, ShoppingBag, Truck, User, X, Zap } from "lucide-react";
import { IMAGES } from "./data";
import { BRAND } from "@/lib/brand";
import { buildWhatsAppUrl, formatStorePhone, generalSupportMessage } from "@/lib/whatsapp";

export function TopBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      {/* single line, never wraps: long promo truncates on small screens */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 whitespace-nowrap px-4 py-2 text-[11px] sm:text-xs lg:text-sm">
        <p className="flex min-w-0 items-center gap-2">
          <Truck className="h-4 w-4 shrink-0 text-leaf" />
          <span className="truncate sm:hidden">Same-day delivery · Free Shipping over PKR 2,500</span>
          <span className="hidden truncate sm:inline">
            Same-day &amp; Express delivery across Lahore, Karachi, Islamabad &amp; 50+ cities across
            Pakistan
          </span>
          <span className="hidden font-semibold text-gold md:inline">
            &nbsp;| Free Shipping over PKR 2,500
          </span>
        </p>
        <div className="flex shrink-0 items-center gap-3">
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

function useIsActive() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

  const isActive = (href) =>
    currentPath === href ||
    (href === "/shop" && currentPath.startsWith("/shop") && !searchParams.toString());

  return { currentPath, isActive };
}

function NavigationLinks({ navLinks }) {
  const { isActive } = useIsActive();

  return (
    <>
      {navLinks.map((link) => {
        if (link.children) {
          const parentActive = link.children.some((c) => isActive(c.href)) || isActive(link.href);
          return <NavDropdown key={link.label} link={link} parentActive={parentActive} isActive={isActive} />;
        }

        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 whitespace-nowrap px-3 py-2.5 text-[13px] font-medium transition ${
              active
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

function NavDropdown({ link, parentActive, isActive }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="group relative shrink-0"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className={`flex shrink-0 items-center gap-1 whitespace-nowrap px-3 py-2.5 text-[13px] font-medium transition ${
          parentActive
            ? "border-b-2 border-secondary font-semibold text-secondary"
            : "text-foreground hover:text-secondary"
        }`}
      >
        {link.label}
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>

      <div
        role="menu"
        className={`absolute left-0 top-full z-50 w-64 rounded-xl border bg-card p-2 shadow-xl transition ${
          open
            ? "visible opacity-100"
            : "invisible opacity-0 group-hover:visible group-hover:opacity-100"
        }`}
      >
        {link.children.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            role="menuitem"
            onClick={() => setOpen(false)}
            className={`block rounded-lg px-3 py-2 text-sm transition ${
              child.strong ? "mb-1 border-b border-foreground/10 pb-2.5 font-extrabold text-primary" : "font-medium"
            } ${
              isActive(child.href)
                ? "bg-surface-low font-semibold text-secondary"
                : "text-foreground hover:bg-surface-low hover:text-secondary"
            }`}
          >
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function MobileNavigationLinks({ navLinks, setMenuOpen }) {
  const { isActive } = useIsActive();

  return (
    <>
      {navLinks.map((link) => {
        if (link.children) {
          return (
            <div key={link.label} className="pt-2">
              <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-widest text-secondary">
                {link.label}
              </p>
              {link.children.map((child, i) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setMenuOpen && setMenuOpen(false)}
                  className={`block rounded-lg py-2 pr-3 text-sm transition ${
                    i === 0 ? "pl-3 font-extrabold text-primary" : "pl-7 text-muted-foreground"
                  } ${
                    isActive(child.href)
                      ? "bg-surface-low !font-semibold !text-secondary"
                      : "hover:bg-surface-low hover:text-secondary"
                  }`}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          );
        }

        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen && setMenuOpen(false)}
            className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active
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
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (alive && data?.success && data.user) setUser(data.user);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : "";
  const accountHref = user ? (user.role === "admin" ? "/admin" : "/account") : "/login";

  const plantLinks = [
    { href: "/shop?category=indoor-plants", label: "Indoor Plants" },
    { href: "/shop?category=fruit-plants", label: "Fruit Plants" },
    { href: "/shop?category=flowering-plants", label: "Flowering" },
    { href: "/shop?category=trees", label: "Trees" },
    { href: "/shop?category=vines-creepers", label: "Vines & Creepers" },
    { href: "/shop?category=herbs", label: "Herbs" },
    { href: "/shop?category=decorative-plants", label: "Decorative" },
    { href: "/shop?type=plants", label: "All Plants" },
  ];

  const accessoryLinks = [
    { href: "/shop?type=accessories", label: "All Accessories", strong: true },
    { href: "/shop?category=fertilizers-soil", label: "Fertilizers & Soil" },
    { href: "/shop?category=pest-control", label: "Pest & Disease Control" },
    { href: "/shop?category=pots-planters", label: "Pots & Planters" },
    { href: "/shop?category=tools-equipment", label: "Tools & Equipment" },
    { href: "/shop?category=watering-sprayers", label: "Watering & Sprayers" },
  ];

  const navLinks = [
    { href: "/shop", label: "All Products" },
    ...plantLinks,
    { href: "/shop?type=accessories", label: "Accessories", children: accessoryLinks },
    { href: "/categories", label: "Categories" },
    { href: "/about", label: "About" },
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
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
          <img
            src={IMAGES.logo}
            alt="Noor Nursery Official Insignia"
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-leaf sm:h-12 sm:w-12"
          />
          <div>
            <p className="whitespace-nowrap font-display text-sm font-bold leading-tight tracking-tight text-primary sm:text-lg lg:text-xl">
              NOOR NURSERY
            </p>
            <p className="hidden whitespace-nowrap text-[11px] font-medium text-muted-foreground sm:block">
              {BRAND.tagline}
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

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href={accountHref}
            className="hidden max-w-[12rem] items-center gap-2 whitespace-nowrap rounded-full border border-primary bg-card px-3.5 py-2 text-sm font-semibold text-primary transition hover:bg-surface-low md:flex"
            aria-label={firstName ? `Account — ${user.name}` : "Account"}
            title={user?.name || "Account"}
          >
            <User className="h-4 w-4 shrink-0" />
            <span className="truncate">{firstName || "Account"}</span>
          </Link>
          <Link
            href="/cart"
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-forest sm:px-4"
            aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden sm:inline">{cartTotal}</span>
            <span className="rounded-full bg-leaf px-1.5 py-0.5 text-[11px] font-bold leading-tight text-leaf-foreground sm:px-2 sm:text-xs">
              {cartCount}
              <span className="hidden sm:inline"> item{cartCount === 1 ? "" : "s"}</span>
            </span>
          </Link>
          <button
            type="button"
            className="rounded-full border bg-surface-low p-2 text-foreground transition hover:bg-surface-mid lg:hidden"
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
              href={accountHref}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
              onClick={() => setMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              <span className="truncate">{user ? user.name : "Login / Create Account"}</span>
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
        {/* no overflow-x here: it would clip the Accessories dropdown */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-1 px-4">
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
