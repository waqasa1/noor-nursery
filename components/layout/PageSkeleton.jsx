const block = "animate-pulse rounded-xl bg-foreground/10";
const blockDark = "animate-pulse rounded-xl bg-primary-foreground/20";

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-card">
      <div className={`${block} h-44 w-full rounded-none`} />
      <div className="space-y-2.5 p-4">
        <div className={`${block} h-4 w-3/4`} />
        <div className={`${block} h-3 w-1/2`} />
        <div className={`${block} h-9 w-full rounded-full`} />
      </div>
    </div>
  );
}

/**
 * Shell shown while a page's server render streams in (loading.js).
 * Mimics the storefront header/footer so navigation never looks frozen.
 */
export function PageSkeleton({ variant = "default" }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* top bar */}
      <div className="bg-primary">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 whitespace-nowrap px-4 py-2">
          <div className={`${blockDark} h-3 w-56 max-w-[55%]`} />
          <div className={`${blockDark} h-3 w-28`} />
        </div>
      </div>

      {/* header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-3 sm:px-4">
          <div className={`${block} h-9 w-9 shrink-0 rounded-full sm:h-12 sm:w-12`} />
          <div className="space-y-1.5">
            <div className={`${block} h-4 w-28 sm:w-36`} />
            <div className={`${block} hidden h-3 w-44 sm:block`} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className={`${block} hidden h-9 w-28 rounded-full md:block`} />
            <div className={`${block} h-9 w-24 rounded-full`} />
          </div>
        </div>
        <div className="hidden border-t bg-surface-low lg:block">
          <div className="mx-auto flex max-w-7xl gap-3 px-4 py-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`${block} h-3.5`} style={{ width: `${5 + (i % 3) * 2}rem` }} />
            ))}
          </div>
        </div>
      </header>

      {/* content */}
      <main className="flex-1">
        {variant === "product" ? (
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-2">
            <div className={`${block} h-80 w-full lg:h-[30rem]`} />
            <div className="space-y-4">
              <div className={`${block} h-4 w-24`} />
              <div className={`${block} h-9 w-3/4`} />
              <div className={`${block} h-5 w-1/3`} />
              <div className={`${block} h-24 w-full`} />
              <div className={`${block} h-12 w-full rounded-full`} />
              <div className={`${block} h-12 w-full rounded-full`} />
            </div>
          </div>
        ) : variant === "grid" ? (
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className={`${block} h-40 w-full rounded-3xl`} />
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className={`${block} h-11 flex-1 min-w-[14rem] rounded-full`} />
              <div className={`${block} h-11 w-36 rounded-full`} />
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mx-auto max-w-7xl px-4 py-8">
              <div className={`${block} h-56 w-full rounded-3xl sm:h-72`} />
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* footer */}
      <footer className="border-t bg-surface-low">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2.5">
              <div className={`${block} h-4 w-28`} />
              <div className={`${block} h-3 w-full`} />
              <div className={`${block} h-3 w-4/5`} />
              <div className={`${block} h-3 w-3/5`} />
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
