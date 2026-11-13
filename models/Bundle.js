import mongoose from "mongoose";

const bundleItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const bundleSchema = new mongoose.Schema(
  {
    nameEn: { type: String, required: true, trim: true },
    nameUr: { type: String, default: "", trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    descriptionEn: { type: String, default: "" },
    descriptionUr: { type: String, default: "" },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    items: {
      type: [bundleItemSchema],
      validate: {
        validator(v) {
          return Array.isArray(v) && v.length >= 2;
        },
        message: "A bundle needs at least two items",
      },
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

bundleSchema.index({ isActive: 1, sortOrder: 1 });
bundleSchema.index({ "items.productId": 1, isActive: 1 });

export default mongoose.models.Bundle || mongoose.model("Bundle", bundleSchema);
