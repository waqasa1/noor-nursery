import { StoreLayout } from "@/components/layout/StoreLayout";

export function PolicyPage({ title, titleUr, children }) {
  return (
    <StoreLayout showFlashDeal={false}>
      <article className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="font-display text-3xl font-bold text-primary">{title}</h1>
        {titleUr && (
          <p className="text-urdu mt-1 text-secondary" dir="rtl" lang="ur">{titleUr}</p>
        )}
        <div className="prose prose-sm mt-8 max-w-none space-y-4 text-muted-foreground [&_h2]:font-display [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8">
          {children}
        </div>
      </article>
    </StoreLayout>
  );
}
