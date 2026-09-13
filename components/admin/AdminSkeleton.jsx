function Bone({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-surface-low ${className}`} aria-hidden="true" />;
}

export function AdminPageHeaderSkeleton({ action = false }) {
  return (
    <div className="flex items-center justify-between">
      <Bone className="h-8 w-48" />
      {action && <Bone className="h-10 w-32 rounded-full" />}
    </div>
  );
}

export function AdminTableSkeleton({ columns = 5, rows = 6 }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
      <div className="border-b bg-surface-low px-3 py-3">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Bone key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex gap-4 px-3 py-4">
            {Array.from({ length: columns }).map((_, col) => (
              <Bone
                key={col}
                className={`h-4 flex-1 ${col === 0 ? "max-w-[40%]" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminMetricsSkeleton({ count = 4 }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-card p-5">
          <Bone className="h-4 w-24" />
          <Bone className="mt-3 h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export function AdminPanelSkeleton({ lines = 4 }) {
  return (
    <div className="mt-8 rounded-2xl border bg-card p-5">
      <Bone className="h-6 w-40" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Bone key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

export function AdminFormSkeleton({ fields = 6 }) {
  return (
    <div className="mt-6 max-w-2xl space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Bone className="mb-2 h-4 w-28" />
          <Bone className="h-10 w-full rounded-xl" />
        </div>
      ))}
      <Bone className="h-10 w-36 rounded-full" />
    </div>
  );
}

export function AdminCategoriesSkeleton() {
  return (
    <>
      <AdminPageHeaderSkeleton />
      <div className="mt-6 max-w-md space-y-3 rounded-2xl border bg-card p-4">
        <Bone className="h-5 w-32" />
        <Bone className="h-10 w-full rounded-xl" />
        <Bone className="h-10 w-full rounded-xl" />
        <Bone className="h-24 w-full rounded-xl" />
        <Bone className="h-9 w-24 rounded-full" />
      </div>
      <div className="mt-6 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Bone key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </>
  );
}

export function AdminOrderDetailSkeleton() {
  return (
    <>
      <Bone className="h-8 w-56" />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 space-y-3">
          <Bone className="h-5 w-24" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-3/4" />
          <Bone className="h-4 w-2/3" />
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-3">
          <Bone className="h-5 w-32" />
          <Bone className="h-10 w-full rounded-xl" />
          <Bone className="h-10 w-full rounded-xl" />
          <Bone className="h-20 w-full rounded-xl" />
        </div>
      </div>
      <AdminPanelSkeleton lines={5} />
    </>
  );
}

export function AdminSettingsSkeleton() {
  return (
    <>
      <Bone className="h-8 w-44" />
      <Bone className="mt-2 h-4 w-96 max-w-full" />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card p-5 space-y-3">
            <Bone className="h-5 w-28" />
            <Bone className="h-10 w-full rounded-xl" />
            <Bone className="h-10 w-full rounded-xl" />
            <Bone className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </>
  );
}
