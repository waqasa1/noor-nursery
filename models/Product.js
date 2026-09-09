import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, enum: ["small", "medium", "large"], required: true },
    sizeLabelEn: { type: String, required: true },
    sizeLabelUr: { type: String, default: "" },
    sku: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    weight: { type: Number },
    dimensions: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    nameEn: { type: String, required: true, trim: true },
    nameUr: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    shortDescriptionEn: { type: String, default: "" },
    shortDescriptionUr: { type: String, default: "" },
    descriptionEn: { type: String, default: "" },
    descriptionUr: { type: String, default: "" },
    careInstructionsEn: { type: String, default: "" },
    careInstructionsUr: { type: String, default: "" },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    images: [{ type: String }],
    featuredImage: { type: String, default: "" },
    variants: [variantSchema],
    tags: [{ type: String }],
    sunlight: { type: String, enum: ["low", "medium", "bright", "direct"], default: "medium" },
    watering: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    difficulty: { type: String, enum: ["easy", "moderate", "advanced"], default: "easy" },
    suitability: { type: String, enum: ["indoor", "outdoor", "both"], default: "indoor" },
    heightInfo: { type: String },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 });
productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ featured: 1, isActive: 1 });
productSchema.index({ nameEn: "text", nameUr: "text", tags: "text" });
productSchema.index({ "variants.sku": 1 });

export default mongoose.models.Product || mongoose.model("Product", productSchema);
