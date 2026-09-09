/**
 * Safe to rerun — skips if categories already exist.
 * Usage: node scripts/seed.js
 * Requires MONGODB_URI in environment.
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { IMAGES, PRODUCTS as MOCK_PRODUCTS } from "../components/nursery/data.js";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Set MONGODB_URI environment variable");
  process.exit(1);
}

const categorySchema = new mongoose.Schema({
  nameEn: String,
  nameUr: String,
  descriptionEn: String,
  descriptionUr: String,
  slug: { type: String, unique: true },
  image: String,
  isActive: { type: Boolean, default: true },
  sortOrder: Number,
});

const variantSchema = new mongoose.Schema({
  size: String,
  sizeLabelEn: String,
  sizeLabelUr: String,
  sku: String,
  price: Number,
  compareAtPrice: Number,
  stock: Number,
  lowStockThreshold: Number,
  isActive: { type: Boolean, default: true },
});

const productSchema = new mongoose.Schema({
  nameEn: String,
  nameUr: String,
  slug: { type: String, unique: true },
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
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  passwordHash: String,
  role: { type: String, default: "customer" },
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);

const CATEGORIES = [
  {
    nameEn: "Indoor Plants",
    nameUr: "انڈور پودے",
    descriptionEn: "Low-light tolerant plants for homes and offices",
    descriptionUr: "گھروں اور دفاتر کے لیے موزوں انڈور پودے",
    slug: "indoor-plants",
    image: IMAGES.indoor,
    sortOrder: 1,
  },
  {
    nameEn: "Outdoor Plants",
    nameUr: "بیرونی پودے",
    descriptionEn: "Hardy plants for gardens, lawns, and terraces",
    descriptionUr: "باغات، lawns اور terraces کے لیے مضبوط پودے",
    slug: "outdoor-plants",
    image: IMAGES.fruitTrees,
    sortOrder: 2,
  },
  {
    nameEn: "Flowering Plants",
    nameUr: "پھولدار پودے",
    descriptionEn: "Beautiful flowering plants for fragrance and color",
    descriptionUr: "خوشبو اور رنگ کے لیے خوبصورت پھولدار پودے",
    slug: "flowering-plants",
    image: IMAGES.flowering,
    sortOrder: 3,
  },
  {
    nameEn: "Succulents",
    nameUr: "رس دار پودے",
    descriptionEn: "Drought-tolerant succulents and cacti",
    descriptionUr: "کم پانی والے رس دار پودے",
    slug: "succulents",
    image: IMAGES.indoor,
    sortOrder: 4,
  },
  {
    nameEn: "Herbs",
    nameUr: "جڑی بوٹیاں",
    descriptionEn: "Fresh kitchen herbs and medicinal plants",
    descriptionUr: "تازہ کITCHEN جڑی بوٹیاں",
    slug: "herbs",
    image: IMAGES.herbs,
    sortOrder: 5,
  },
  {
    nameEn: "Pots and Planters",
    nameUr: "گملے اور پلانٹرز",
    descriptionEn: "Quality pots and self-watering planters",
    descriptionUr: "معیاری گملے اور self-watering planters",
    slug: "pots-planters",
    image: IMAGES.selfWatering,
    sortOrder: 6,
  },
  {
    nameEn: "Fertilizers and Soil",
    nameUr: "کھاد اور مٹی",
    descriptionEn: "Organic fertilizers and premium potting mix",
    descriptionUr: "نامیاتی کھاد اور premium potting mix",
    slug: "fertilizers-soil",
    image: IMAGES.paneeri,
    sortOrder: 7,
  },
];

const SIZE_MAP = [
  { size: "small", labelEn: 'Small 6"', labelUr: "چھوٹا 6 انچ", priceFactor: 1 },
  { size: "medium", labelEn: 'Medium 14"', labelUr: "درمیانہ 14 انچ", priceFactor: 1.4 },
  { size: "large", labelEn: "Large 3ft", labelUr: "بڑا 3 فٹ", priceFactor: 1.8 },
];

const CATEGORY_MAP = {
  indoor: "indoor-plants",
  flowering: "flowering-plants",
  fruit: "outdoor-plants",
};

function parsePrice(str) {
  return parseInt(String(str).replace(/[^\d]/g, ""), 10) || 0;
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const existing = await Category.countDocuments();
  if (existing > 0) {
    console.log("Categories already seeded, skipping category/product seed.");
  } else {
    const createdCategories = {};
    for (const cat of CATEGORIES) {
      const doc = await Category.create(cat);
      createdCategories[cat.slug] = doc._id;
      console.log("Created category:", cat.nameEn);
    }

    for (const mock of MOCK_PRODUCTS) {
      const catSlug = CATEGORY_MAP[mock.category] || "indoor-plants";
      const categoryId = createdCategories[catSlug];
      const basePrice = parsePrice(mock.price);

      const variants = SIZE_MAP.map((s, i) => ({
        size: s.size,
        sizeLabelEn: mock.sizes[i] || s.labelEn,
        sizeLabelUr: s.labelUr,
        sku: `${mock.id}-${s.size}`.toUpperCase(),
        price: Math.round(basePrice * s.priceFactor),
        compareAtPrice: parsePrice(mock.oldPrice) * s.priceFactor,
        stock: 20 + i * 5,
        lowStockThreshold: 5,
        isActive: true,
      }));

      await Product.create({
        nameEn: mock.name,
        nameUr: mock.urdu,
        slug: mock.id,
        shortDescriptionEn: mock.care,
        shortDescriptionUr: "",
        descriptionEn: `${mock.name} (${mock.botanical}) — ${mock.care}. ${mock.reviews}.`,
        descriptionUr: `${mock.urdu} — پاکستانی موسم کے لیے موزوں۔`,
        careInstructionsEn: mock.care,
        careInstructionsUr: "روزانہ کی دیکھ بھال کے لیے پروڈکٹ صفحہ دیکھیں۔",
        categoryId,
        images: [mock.image],
        featuredImage: mock.image,
        variants,
        tags: mock.tags,
        featured: mock.tags?.includes("Best Seller"),
        isActive: true,
        sunlight: "medium",
        watering: "medium",
        difficulty: "easy",
        suitability: mock.category === "fruit" ? "outdoor" : "indoor",
      });
      console.log("Created product:", mock.name);
    }
  }

  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "admin@noornursery.pk";
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || "Admin123!Secure";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await User.create({
      name: "Admin",
      email: adminEmail,
      phone: "03001234567",
      passwordHash,
      role: "admin",
    });
    console.log("Created admin user:", adminEmail);
  } else {
    console.log("Admin user already exists");
  }

  await mongoose.disconnect();
  console.log("Seed complete");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
