import { getEnv } from "@/lib/env";

/** @type {import('./types').PaymentProvider} */
export const bankTransferProvider = {
  id: "bank_transfer",
  labelEn: "Bank Transfer",
  labelUr: "بینک ٹرانسفر",
  descriptionEn: "Transfer to our bank account and use order number as reference",
  descriptionUr: "ہمارے بینک اکاؤنٹ میں رقم بھیجیں اور آرڈر نمبر بطور حوالہ استعمال کریں",

  getBankDetails() {
    const env = getEnv();
    return {
      accountTitle: env.BANK_ACCOUNT_TITLE || "Noor Nursery",
      accountNumber: env.BANK_ACCOUNT_NUMBER || "",
      bankName: env.BANK_NAME || "HBL",
      branch: env.BANK_BRANCH || "",
    };
  },

  async initiate({ order }) {
    const bank = this.getBankDetails();
    return {
      success: true,
      paymentStatus: "pending",
      orderStatus: "awaiting_payment",
      redirectUrl: `/order-success/${order.orderNumber}?payment=bank_transfer`,
      bankDetails: bank,
      message: "Order placed. Please complete bank transfer.",
    };
  },

  async handleCallback() {
    return { success: false, message: "Bank transfer uses manual verification" };
  },

  async verifyPayment() {
    return { verified: false, requiresManualReview: true };
  },
};
