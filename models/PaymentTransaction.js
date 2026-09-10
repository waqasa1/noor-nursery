import mongoose from "mongoose";

const paymentTransactionSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    orderNumber: { type: String, required: true },
    provider: {
      type: String,
      enum: ["cod", "bank_transfer", "jazzcash", "easypaisa", "payfast"],
      required: true,
    },
    idempotencyKey: { type: String, required: true, unique: true },
    externalReference: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "PKR" },
    status: {
      type: String,
      enum: ["initiated", "pending", "success", "failed", "cancelled", "refunded"],
      default: "initiated",
    },
    rawResponse: { type: mongoose.Schema.Types.Mixed },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

paymentTransactionSchema.index({ orderId: 1 });
paymentTransactionSchema.index({ externalReference: 1 });

export default mongoose.models.PaymentTransaction ||
  mongoose.model("PaymentTransaction", paymentTransactionSchema);
