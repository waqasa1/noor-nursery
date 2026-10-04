const block = "animate-pulse rounded-xl bg-foreground/10";

/** Admin shells load through their own client layout — keep this neutral. */
export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <div className={`${block} h-8 w-8 rounded-full`} />
          <div className={`${block} h-4 w-32`} />
          <div className={`${block} ml-auto h-9 w-28 rounded-full`} />
        </div>
      </div>
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-8">
        <div className={`${block} h-7 w-56`} />
        <div className={`${block} h-11 w-full rounded-full`} />
        <div className={`${block} h-64 w-full`} />
      </div>
    </div>
  );
}
