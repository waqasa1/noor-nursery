import Link from "next/link";
import { getActiveBundles } from "@/lib/data/bundles";
import { BundleCard } from "@/components/catalog/BundleCard";
import { absoluteUrl } from "@/lib/seo/structured-data";

export const revalidate = false;

export const metadata = {
  title: "Plant Bundles",
  description:
    "Curated plant and accessory bundles from Noor Nursery — set price, ready to gift or grow.",
  alternates: { canonical: absoluteUrl("/bundles") },
};

export default async function BundlesPage() {
  let bundles = [];
  try {
    bundles = await getActiveBundles();
  } catch (error) {
    console.error("[bundles] Failed to load:", error.message);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-secondary">Bundles</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Ready-made plant sets
        </h1>
        <p className="mt-3 text-muted-foreground">
          Each bundle is a fixed set of plants and accessories at one price. Add the whole set in one tap.
        </p>
      </div>

      {bundles.length === 0 ? (
        <div className="mt-12 rounded-3xl border bg-card px-6 py-16 text-center">
          <p className="font-display text-xl font-bold text-foreground">No bundles right now</p>
          <p className="mt-2 text-muted-foreground">Browse the shop while we prepare the next set.</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            Shop plants
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle) => (
            <BundleCard key={bundle._id} bundle={bundle} />
          ))}
        </div>
      )}
    </div>
  );
}
