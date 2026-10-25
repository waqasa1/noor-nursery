export default function StoreLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 py-16" aria-busy="true" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
