import { ContentHero } from "@/components/content/ContentHero";
import { storePublicEmail } from "@/lib/brand";

/**
 * Editorial legal / policy layout — document feel, not a floating card.
 */
export function PolicyPage({ title, titleUr, lead, children, updated }) {
  const email = storePublicEmail();

  return (
    <>
      <ContentHero title={title} titleUr={titleUr} lead={lead} />

      <div className="relative bg-[linear-gradient(180deg,var(--surface-low)_0%,var(--background)_28%,var(--background)_100%)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14 lg:px-6 lg:py-20">
          <aside className="hidden lg:block">
            <div className="sticky top-40 space-y-4 pt-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-secondary">
                On this page
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Scroll the sections below. Questions? Email{" "}
                <a href={`mailto:${email}`} className="font-semibold text-secondary hover:underline">
                  {email}
                </a>
                .
              </p>
              {updated ? (
                <p className="text-xs text-muted-foreground">Updated {updated}</p>
              ) : null}
            </div>
          </aside>

          <article className="min-w-0">
            {updated ? (
              <p className="mb-8 inline-flex rounded-full bg-surface-mid px-3 py-1 text-xs font-semibold text-secondary lg:hidden">
                Updated {updated}
              </p>
            ) : null}
            <div
              className="
                space-y-10 text-[15px] leading-relaxed text-foreground/85 sm:text-base
                [&_a]:font-semibold [&_a]:text-secondary [&_a]:underline-offset-2 hover:[&_a]:underline
                [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-primary
                [&_h2]:relative [&_h2]:border-l-4 [&_h2]:border-leaf [&_h2]:pl-4
                [&_li]:pl-1 [&_p]:max-w-3xl [&_strong]:text-foreground
                [&_ul]:list-disc [&_ul]:space-y-2.5 [&_ul]:pl-5 [&_ul]:marker:text-secondary
              "
            >
              {children}
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
