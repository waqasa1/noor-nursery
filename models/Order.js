import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productSlug: { type: String, required: true },
    nameEn: { type: String, required: true },
    nameUr: { type: String, required: true },
    variantId: { type: String, required: true },
    size: { type: String, required: true },
    sizeLabelEn: { type: String, required: true },
    sizeLabelUr: { type: String, default: "" },
    sku: { type: String, required: true },
    image: { type: String },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const addressSnapshotSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    email: String,
    addressLine1: String,
    addressLine2: String,
    area: String,
    city: String,
    province: String,
    postalCode: String,
    country: { type: String, default: "Pakistan" },
    deliveryInstructions: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shippingAddress: addressSnapshotSchema,
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "PKR" },
    paymentMethod: {
      type: String,
      enum: ["cod", "bank_transfer", "jazzcash", "easypaisa", "payfast"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "unpaid",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "awaiting_payment",
        "payment_review",
        "paid",
        "processing",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    paymentReference: { type: String },
    paymentGatewayResponse: { type: mongoose.Schema.Types.Mixed },
    bankTransferProof: { type: String },
    customerNote: { type: String },
    internalNote: { type: String },
    emailSent: {
      confirmation: { type: Boolean, default: false },
      statusUpdate: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ "customer.email": 1 });
orderSchema.index({ "customer.phone": 1 });
orderSchema.index({ orderStatus: 1, paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
