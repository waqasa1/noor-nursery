import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    nameEn: { type: String, required: true, trim: true },
    nameUr: { type: String, required: true, trim: true },
    descriptionEn: { type: String, default: "" },
    descriptionUr: { type: String, default: "" },
    slug: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

categorySchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.models.Category || mongoose.model("Category", categorySchema);
