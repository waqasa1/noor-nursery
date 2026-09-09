import { StoreLayout } from "@/components/layout/StoreLayout";
import { IMAGES } from "@/components/nursery/data";
import { Leaf } from "lucide-react";

export function PolicyPage({ title, titleUr, children }) {
  return (
    <StoreLayout showFlashDeal={false}>
      {/* Decorative Header */}
      <div className="relative h-64 w-full bg-primary lg:h-80">
        <div className="absolute inset-0 z-0 opacity-30">
          <img src={IMAGES.indoor} alt="Plants background" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-primary/70 mix-blend-multiply"></div>
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-leaf text-leaf-foreground shadow-lg">
            <Leaf className="h-7 w-7" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">{title}</h1>
          {titleUr && (
            <p className="text-urdu mt-3 text-xl text-primary-foreground/90" dir="rtl" lang="ur">{titleUr}</p>
          )}
        </div>
      </div>
      
      {/* Content Body */}
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-3xl border bg-card p-8 shadow-sm sm:p-12">
          <div className="prose prose-base sm:prose-lg max-w-none space-y-6 text-muted-foreground [&_h2]:font-display [&_h2]:text-primary [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:border-b [&_h2]:pb-2 [&_h2]:border-border [&_p]:leading-relaxed [&_ul]:space-y-3 [&_ul]:marker:text-secondary">
            {children}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
