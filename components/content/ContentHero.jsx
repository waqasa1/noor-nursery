import Link from "next/link";

/**
 * Slim brand-led hero for About / Contact / policy pages.
 * Gradient + pattern only (no remote Google image) so these pages paint fast.
 */
export function ContentHero({
  eyebrow = "Noor Nursery",
  title,
  titleUr,
  lead,
  actions,
}) {
  return (
    <header className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-forest" />
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 22%, var(--leaf) 0.7px, transparent 0.8px), radial-gradient(circle at 82% 68%, color-mix(in oklab, var(--gold) 70%, transparent) 0.55px, transparent 0.65px)",
          backgroundSize: "20px 20px, 28px 28px",
        }}
      />
      <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-leaf/15 blur-3xl" aria-hidden />
      <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-gold/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto flex min-h-[36vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-20 sm:min-h-[32vh] sm:pb-14 lg:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-leaf">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {titleUr ? (
          <p className="text-urdu mt-3 text-xl text-primary-foreground/85 sm:text-2xl" dir="rtl" lang="ur">
            {titleUr}
          </p>
        ) : null}
        {lead ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
            {lead}
          </p>
        ) : null}
        {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}

export function ContentCtaLink({ href, children, variant = "primary" }) {
  const styles =
    variant === "primary"
      ? "bg-leaf text-leaf-foreground hover:bg-gold hover:text-gold-foreground"
      : "border border-primary-foreground/35 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20";
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full px-5 py-2.5 text-sm font-bold transition ${styles}`}
    >
      {children}
    </Link>
  );
}
