/**
 * Seeds categories and products from the spreadsheets in scripts/catalog/.
 *
 *   npm run seed:catalog
 *
 * Source of truth: scripts/catalog/source/*.xlsb|xlsx
 *   1. python3 scripts/catalog/build.py      -> catalog.json (English data)
 *   2. npm run seed:catalog                  -> MongoDB
 *
 * Replaces every existing category and product. Users, orders and payment
 * records are left untouched. Safe to re-run.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CATALOG = JSON.parse(fs.readFileSync(path.join(HERE, "catalog.json"), "utf8"));
const URDU = JSON.parse(fs.readFileSync(path.join(HERE, "urdu.json"), "utf8"));

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Set MONGODB_URI environment variable");
  process.exit(1);
}

// ---- validate before touching the database -------------------------------
const missingUrdu = CATALOG.products.filter((p) => !URDU.products[p.slug]?.trim());
const missingCatUrdu = CATALOG.categories.filter((c) => !URDU.categories[c.slug]?.nameUr?.trim());
if (missingUrdu.length || missingCatUrdu.length) {
  console.error("Missing Urdu names in urdu.json for:");
  for (const p of missingUrdu) console.error("  product:  ", p.slug);
  for (const c of missingCatUrdu) console.error("  category: ", c.slug);
  process.exit(1);
}

const categorySchema = new mongoose.Schema(
  {
    nameEn: String,
    nameUr: String,
    descriptionEn: String,
    descriptionUr: String,
    slug: { type: String, unique: true, lowercase: true },
    type: { type: String, enum: ["plant", "accessory"], default: "plant" },
    image: String,
    isActive: { type: Boolean, default: true },
    sortOrder: Number,
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true }
);

const variantSchema = new mongoose.Schema({
  size: String,
  sizeLabelEn: String,
  sizeLabelUr: String,
  sku: String,
  price: Number,
  compareAtPrice: Number,
  stock: Number,
  lowStockThreshold: Number,
  weight: Number,
  dimensions: String,
  image: String,
  isActive: { type: Boolean, default: true },
});

const productSchema = new mongoose.Schema(
  {
    nameEn: String,
    nameUr: String,
    slug: { type: String, unique: true, lowercase: true },
    shortDescriptionEn: String,
    shortDescriptionUr: String,
    descriptionEn: String,
    descriptionUr: String,
    careInstructionsEn: String,
    careInstructionsUr: String,
    categoryId: mongoose.Schema.Types.ObjectId,
    images: [String],
    featuredImage: String,
    variants: [variantSchema],
    tags: [String],
    featured: Boolean,
    isActive: { type: Boolean, default: true },
    sunlight: String,
    watering: String,
    difficulty: String,
    suitability: String,
    heightInfo: String,
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const [oldProducts, oldCategories] = await Promise.all([
    Product.deleteMany({}),
    Category.deleteMany({}),
  ]);
  console.log(`Removed ${oldProducts.deletedCount} products, ${oldCategories.deletedCount} categories`);

  const categoryIds = {};
  for (const cat of CATALOG.categories) {
    const urdu = URDU.categories[cat.slug];
    const doc = await Category.create({
      nameEn: cat.nameEn,
      nameUr: urdu.nameUr,
      descriptionEn: cat.descriptionEn,
      descriptionUr: urdu.descriptionUr || "",
      slug: cat.slug,
      type: cat.kind === "accessory" ? "accessory" : "plant",
      image: cat.image || "",
      isActive: true,
      sortOrder: cat.sortOrder,
    });
    categoryIds[cat.key] = doc._id;
    console.log(`  category  ${cat.slug}`);
  }

  let created = 0;
  let variants = 0;
  for (const item of CATALOG.products) {
    const categoryId = categoryIds[item.categoryKey];
    if (!categoryId) throw new Error(`Unknown category key: ${item.categoryKey}`);

    const category = CATALOG.categories.find((c) => c.key === item.categoryKey);
    const nameUr = URDU.products[item.slug];

    const payload = {
      nameEn: item.nameEn,
      nameUr,
      slug: item.slug,
      shortDescriptionEn: item.shortDescriptionEn || "",
      shortDescriptionUr: "",
      descriptionEn: item.descriptionEn || "",
      descriptionUr: `${nameUr} — ${URDU.categories[category.slug].nameUr}. سائز اور قیمت کی تفصیل ذیل میں موجود ہے۔`,
      careInstructionsEn: item.careInstructionsEn || "",
      careInstructionsUr: "",
      categoryId,
      images: item.image ? [item.image] : [],
      featuredImage: item.image || "",
      variants: item.variants.map((v) => ({
        size: v.size,
        sizeLabelEn: v.sizeLabelEn,
        sizeLabelUr: v.sizeLabelUr || "",
        sku: `${item.slug}-${v.size}`.toUpperCase(),
        price: v.price,
        stock: v.stock ?? 20,
        lowStockThreshold: 5,
        weight: v.weight ?? undefined,
        dimensions: v.dimensions || "",
        isActive: true,
      })),
      tags: item.tags || [],
      featured: Boolean(item.featured),
      isActive: Boolean(item.isActive),
      sunlight: item.sunlight,
      watering: item.watering,
      difficulty: item.difficulty,
      suitability: item.suitability,
      heightInfo: item.heightInfo || "",
      seoTitle: item.nameEn,
      seoDescription: item.shortDescriptionEn || item.descriptionEn || "",
    };

    await Product.create(payload);
    created += 1;
    variants += payload.variants.length;
  }

  console.log(`Created ${created} products with ${variants} variants`);

  await mongoose.disconnect();
  console.log("Seed complete");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
