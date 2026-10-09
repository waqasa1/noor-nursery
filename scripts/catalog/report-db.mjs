/**
 * Catalog data-quality report — live MongoDB level.
 *
 *   node --env-file=.env.local scripts/catalog/report-db.mjs
 *
 * Reports what the storefront ACTUALLY has (after seeding + admin edits):
 * empty prices/descriptions/sizes/Urdu/images per product, plus drift against
 * scripts/catalog.json. Read-only.
 *
 * Writes scripts/catalog/report-db.json and prints a summary.
 */
import fs from "node:fs";
import mongoose from "mongoose";

const HERE = new URL(".", import.meta.url);
const CATALOG = JSON.parse(fs.readFileSync(new URL("./catalog.json", HERE), "utf8"));
const OUT = new URL("./report-db.json", HERE);
const PLACEHOLDER = "/placeholder-plant.jpg";

if (!process.env.MONGODB_URI) {
  console.error("Set MONGODB_URI (use --env-file=.env.local)");
  process.exit(1);
}

const bare = new mongoose.Schema({}, { strict: false, versionKey: false });
const Category = mongoose.model("ReportCategory", bare, "categories");
const Product = mongoose.model("ReportProduct", bare, "products");

const empty = (v) => v === undefined || v === null || String(v).trim() === "";
const URDU_TEMPLATE_HINT = "سائز اور قیمت";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const [categories, products] = await Promise.all([
    Category.find({}).lean(),
    Product.find({}).lean(),
  ]);

  const catById = new Map(categories.map((c) => [String(c._id), c]));
  const typeOf = (p) => catById.get(String(p.categoryId))?.type || "unknown";

  const plants = products.filter((p) => typeOf(p) === "plant");
  const accessories = products.filter((p) => typeOf(p) === "accessory");

  const slugs = (list) => list.map((p) => p.slug).sort();

  const withEmptyImage = products.filter(
    (p) => !p.images?.length || p.images.every((i) => empty(i) || i === PLACEHOLDER)
  );
  const withRealImage = products.filter(
    (p) => (p.images || []).some((i) => !empty(i) && i !== PLACEHOLDER)
  );

  const noVariants = products.filter((p) => !p.variants?.length);
  const badPrice = [];
  const noUrduSizeLabel = [];
  const outOfStock = [];
  let variantTotal = 0;
  for (const p of products) {
    for (const v of p.variants || []) {
      variantTotal += 1;
      if (!(v.price > 0)) badPrice.push(`${p.slug}::${v.size ?? "?"}`);
      if (empty(v.sizeLabelUr)) noUrduSizeLabel.push(`${p.slug}::${v.size ?? "?"}`);
      if (!(v.stock > 0)) outOfStock.push(`${p.slug}::${v.size ?? "?"}`);
    }
  }

  const descriptionUrIsTemplate = (p) =>
    !empty(p.descriptionUr) && String(p.descriptionUr).includes(URDU_TEMPLATE_HINT);

  const fieldGaps = {
    nameEn: slugs(products.filter((p) => empty(p.nameEn))),
    nameUr: slugs(products.filter((p) => empty(p.nameUr))),
    shortDescriptionEn: slugs(products.filter((p) => empty(p.shortDescriptionEn))),
    shortDescriptionUr: slugs(products.filter((p) => empty(p.shortDescriptionUr))),
    descriptionEn: slugs(products.filter((p) => empty(p.descriptionEn))),
    descriptionUr_real: slugs(products.filter((p) => empty(p.descriptionUr) || descriptionUrIsTemplate(p))),
    careInstructionsEn_plants: slugs(plants.filter((p) => empty(p.careInstructionsEn))),
    careInstructionsUr: slugs(products.filter((p) => empty(p.careInstructionsUr))),
    heightInfo_plants: slugs(plants.filter((p) => empty(p.heightInfo))),
    seoTitle: slugs(products.filter((p) => empty(p.seoTitle))),
    seoDescription: slugs(products.filter((p) => empty(p.seoDescription))),
    categoryMissing: slugs(products.filter((p) => empty(p.categoryId))),
    noTags: slugs(products.filter((p) => !p.tags?.length)),
    image_placeholderOrMissing: slugs(withEmptyImage),
  };

  // drift vs catalog.json
  const catalogBySlug = new Map(CATALOG.products.map((p) => [p.slug, p]));
  const dbBySlug = new Map(products.map((p) => [p.slug, p]));
  const dbOnly = products.filter((p) => !catalogBySlug.has(p.slug)).map((p) => p.slug).sort();
  const catalogOnly = CATALOG.products.filter((p) => !dbBySlug.has(p.slug)).map((p) => p.slug).sort();

  const priceDrift = [];
  for (const [slug, cp] of catalogBySlug) {
    const dp = dbBySlug.get(slug);
    if (!dp) continue;
    for (const cv of cp.variants || []) {
      const dv = (dp.variants || []).find((v) => v.size === cv.size);
      if (dv && Number(dv.price) !== Number(cv.price)) {
        priceDrift.push({ slug, size: cv.size, catalog: cv.price, db: dv.price });
      }
    }
  }

  const report = {
    generatedBy: "scripts/catalog/report-db.mjs",
    generatedAt: new Date().toISOString(),
    totals: {
      products: products.length,
      plants: plants.length,
      accessories: accessories.length,
      categories: categories.length,
      variants: variantTotal,
      featured: products.filter((p) => p.featured).length,
      inactive: products.filter((p) => p.isActive === false).length,
    },
    fieldGaps,
    variants: {
      productsWithNoVariants: slugs(noVariants),
      priceMissingOrZero: badPrice,
      withoutUrduSizeLabel: noUrduSizeLabel.length,
      outOfStock: outOfStock,
    },
    images: {
      placeholderOrMissing: fieldGaps.image_placeholderOrMissing.length,
      withRealImage: withRealImage.length,
      realImageSlugs: withRealImage.map((p) => p.slug).sort(),
    },
    urdu: {
      missingNameUr: fieldGaps.nameUr.length,
      missingRealDescriptionUr: fieldGaps.descriptionUr_real.length,
      missingShortDescriptionUr: fieldGaps.shortDescriptionUr.length,
      missingCareInstructionsUr: fieldGaps.careInstructionsUr.length,
      missingSizeLabelUrVariants: noUrduSizeLabel.length,
    },
    drift: { dbOnlySlugs: dbOnly, catalogOnlySlugs: catalogOnly, priceDrift },
  };

  fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
  console.log("=== LIVE DB ===");
  console.log(`products ${report.totals.products} (plants ${report.totals.plants}, accessories ${report.totals.accessories}) variants ${report.totals.variants}`);
  for (const [k, v] of Object.entries(fieldGaps)) console.log(`  ${String(k).padEnd(32)} ${v.length}`);
  console.log(`  variants with no/0 price           ${badPrice.length}`);
  console.log(`  products with NO variants          ${report.variants.productsWithNoVariants.length}`);
  console.log(`  images: placeholder ${report.images.placeholderOrMissing} / real ${report.images.withRealImage}`);
  console.log(`  drift: db-only ${dbOnly.length}, catalog-only ${catalogOnly.length}, price diffs ${priceDrift.length}`);
  console.log(`written -> ${OUT.pathname}`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
