const block = "animate-pulse rounded-xl bg-foreground/10";

/** Content-only — sidebar comes from admin/layout.jsx */
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className={`${block} h-7 w-56`} />
      <div className={`${block} h-11 w-full rounded-full`} />
      <div className={`${block} h-64 w-full`} />
    </div>
  );
}
