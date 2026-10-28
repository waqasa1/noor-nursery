import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContentHero } from "@/components/content/ContentHero";
import { BRAND, storePublicEmail } from "@/lib/brand";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildWhatsAppUrl, formatStorePhone, generalSupportMessage } from "@/lib/whatsapp";
import { ContactForm } from "./ContactForm";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Reach Noor Nursery for orders, plant care, and wholesale. Visit our main office in Gulzar-e-Hijri, Karachi, or WhatsApp us.",
  path: "/contact",
});

export default function ContactPage() {
  const email = storePublicEmail();
  const phone = formatStorePhone();
  const phoneDigits = phone.replace(/\D/g, "");
  const office = BRAND.mainOffice;

  const channels = [
    {
      icon: Phone,
      label: "Phone",
      value: phone,
      href: `tel:+${phoneDigits}`,
      hint: "Calls during business hours",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "Message us",
      href: buildWhatsAppUrl(generalSupportMessage()),
      hint: "Fastest for order questions",
      external: true,
    },
    {
      icon: Mail,
      label: "Email",
      value: email,
      href: `mailto:${email}`,
      hint: "Orders, care & privacy",
    },
    {
      icon: MapPin,
      label: office.label,
      value: office.address,
      href: office.mapsUrl,
      hint: "Scheme 33, Karachi · Open in Google Maps",
      external: true,
      multiline: true,
    },
  ];

  return (
    <>
      <ContentHero
        title="Contact us"
        titleUr="رابطہ کریں"
        lead="Orders, plant care, wholesale — we’re here to help. Prefer WhatsApp for the quickest reply."
      />

      <div className="bg-[linear-gradient(180deg,var(--surface-low)_0%,var(--background)_40%,var(--background)_100%)]">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 lg:px-6 lg:py-20">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-secondary">Reach us</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-primary">
              Talk to Noor Nursery
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{BRAND.name}</strong> — nursery since{" "}
              {BRAND.since}. We ship across Pakistan; visit our main office or message first for
              wholesale or pickup.
            </p>

            <ul className="mt-10 space-y-0 divide-y divide-border/80 border-y border-border/80">
              {channels.map((c) => {
                const inner = (
                  <>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-mid text-secondary">
                      <c.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {c.label}
                      </span>
                      <span
                        className={`mt-0.5 block font-semibold text-foreground ${
                          c.multiline ? "whitespace-normal leading-snug" : "truncate"
                        }`}
                      >
                        {c.value}
                      </span>
                      {c.hint ? (
                        <span className="mt-0.5 block text-xs text-muted-foreground">{c.hint}</span>
                      ) : null}
                    </span>
                  </>
                );

                return (
                  <li key={c.label}>
                    {c.href ? (
                      <a
                        href={c.href}
                        {...(c.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="flex items-center gap-4 py-4 transition hover:bg-surface-low/80"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="flex items-center gap-4 py-4">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>

            <p className="mt-8 text-sm text-muted-foreground">
              Delivery across Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and 50+ cities.
            </p>
            <p className="text-urdu mt-2 text-secondary" dir="rtl" lang="ur">
              لاہور، کراچی، اسلام آباد اور 50+ شہروں میں ڈیلیوری۔
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-border/70 bg-card/80 p-6 shadow-[0_20px_50px_-36px_rgba(20,60,40,0.35)] backdrop-blur-sm sm:p-8">
            <h2 className="font-display text-2xl font-bold text-primary">Send a message</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We read every note — usually within one business day.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-16 lg:px-6 lg:pb-20">
          <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-[0_20px_50px_-36px_rgba(20,60,40,0.35)]">
            <div className="flex flex-col gap-2 border-b border-border/70 px-6 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-secondary">
                  Visit us
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-primary">
                  Main office — Karachi
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {office.address}
                </p>
              </div>
              <a
                href={office.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 text-sm font-bold text-secondary hover:text-primary"
              >
                Open in Google Maps →
              </a>
            </div>
            <div className="relative aspect-[16/10] w-full bg-surface-low sm:aspect-[21/9]">
              <iframe
                title="Noor Nursery main office on Google Maps"
                src={office.mapsEmbedUrl}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
