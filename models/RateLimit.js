import mongoose from "mongoose";

const rateLimitSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, default: 1 },
    resetAt: { type: Date, required: true },
  },
  { timestamps: false }
);

rateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.RateLimit ||
  mongoose.model("RateLimit", rateLimitSchema);
