const block = "animate-pulse rounded-xl bg-foreground/10";

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
 * Content-only shell while a page streams in.
 * Header/footer live in (store)/layout — do not skeleton them here.
 */
export function PageSkeleton({ variant = "default" }) {
  if (variant === "product") {
    return (
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
    );
  }

  if (variant === "grid") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className={`${block} h-40 w-full rounded-3xl`} />
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className={`${block} h-11 min-w-[14rem] flex-1 rounded-full`} />
          <div className={`${block} h-11 w-36 rounded-full`} />
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className={`${block} h-56 w-full rounded-3xl sm:h-72`} />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
