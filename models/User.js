import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    area: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String, default: "Pakistan" },
    deliveryInstructions: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    addresses: [addressSchema],
    emailVerified: { type: Date },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model("User", userSchema);
