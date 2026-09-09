import crypto from "crypto";
import { getEnv } from "@/lib/env";

/** @type {import('./types').PaymentProvider} */
export const jazzcashProvider = {
  id: "jazzcash",
  labelEn: "JazzCash",
  labelUr: "جazzCash",
  descriptionEn: "Pay securely via JazzCash mobile wallet",
  descriptionUr: "JazzCash موبائل والیٹ سے محفوظ ادائیگی",

  isConfigured() {
    const env = getEnv();
    return !!(env.JAZZCASH_MERCHANT_ID && env.JAZZCASH_PASSWORD && env.JAZZCASH_INTEGRITY_SALT);
  },

  generateSecureHash(params, salt) {
    const sorted = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        if (params[key] !== "" && params[key] != null) acc[key] = params[key];
        return acc;
      }, {});
    const str = salt + Object.values(sorted).join("&");
    return crypto.createHmac("sha256", salt).update(str).digest("hex");
  },

  async initiate({ order }) {
    const env = getEnv();
    if (!this.isConfigured()) {
      return { success: false, error: "JazzCash is not configured" };
    }

    const params = {
      pp_Amount: Math.round(order.total * 100).toString(),
      pp_BillReference: order.orderNumber,
      pp_Description: `Noor Nursery Order ${order.orderNumber}`,
      pp_MerchantID: env.JAZZCASH_MERCHANT_ID,
      pp_Password: env.JAZZCASH_PASSWORD,
      pp_ReturnURL: env.JAZZCASH_RETURN_URL,
      pp_TxnDateTime: new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14),
      pp_TxnRefNo: `T${Date.now()}`,
      pp_TxnType: "MWALLET",
      pp_Version: "1.1",
    };

    params.pp_SecureHash = this.generateSecureHash(params, env.JAZZCASH_INTEGRITY_SALT);

    return {
      success: true,
      paymentStatus: "pending",
      orderStatus: "awaiting_payment",
      formAction: "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
      formParams: params,
      redirectUrl: null,
    };
  },

  async handleCallback(payload) {
    const env = getEnv();
    const { pp_SecureHash, ...rest } = payload;
    const computed = this.generateSecureHash(rest, env.JAZZCASH_INTEGRITY_SALT);

    if (pp_SecureHash !== computed) {
      return { success: false, verified: false, error: "Invalid signature" };
    }

    const success = payload.pp_ResponseCode === "000";
    return {
      success,
      verified: true,
      paymentStatus: success ? "paid" : "failed",
      orderStatus: success ? "paid" : "awaiting_payment",
      reference: payload.pp_TxnRefNo,
      orderNumber: payload.pp_BillReference,
    };
  },

  async verifyPayment(payload) {
    return this.handleCallback(payload);
  },
};
