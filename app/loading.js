import { PageSkeleton } from "@/components/layout/PageSkeleton";

/** Instant feedback while a storefront page streams in (client nav + first load). */
export default function Loading() {
  return <PageSkeleton variant="default" />;
}
