import crypto from "crypto";
import { getEnv } from "@/lib/env";

/** @type {import('./types').PaymentProvider} */
export const easypaisaProvider = {
  id: "easypaisa",
  labelEn: "EasyPaisa",
  labelUr: "EasyPaisa",
  descriptionEn: "Pay securely via EasyPaisa mobile wallet",
  descriptionUr: "EasyPaisa موبائل والیٹ سے محفوظ ادائیگی",

  isConfigured() {
    const env = getEnv();
    return !!(env.EASYPAISA_STORE_ID && env.EASYPAISA_HASH_KEY);
  },

  generateHash(params, hashKey) {
    const str = Object.values(params).join("") + hashKey;
    return crypto.createHash("sha256").update(str).digest("hex");
  },

  async initiate({ order }) {
    const env = getEnv();
    if (!this.isConfigured()) {
      return { success: false, error: "EasyPaisa is not configured" };
    }

    const params = {
      storeId: env.EASYPAISA_STORE_ID,
      amount: order.total.toFixed(2),
      postBackURL: env.EASYPAISA_RETURN_URL,
      orderRefNum: order.orderNumber,
      expiryDate: "",
      merchantHashedReq: "",
      autoRedirect: "1",
      paymentMethod: "InitialRequest",
    };

    params.merchantHashedReq = this.generateHash(
      {
        storeId: params.storeId,
        amount: params.amount,
        postBackURL: params.postBackURL,
        orderRefNum: params.orderRefNum,
      },
      env.EASYPAISA_HASH_KEY
    );

    return {
      success: true,
      paymentStatus: "pending",
      orderStatus: "awaiting_payment",
      formAction: "https://easypay.easypaisa.com.pk/easypay/Index.jsf",
      formParams: params,
      redirectUrl: null,
    };
  },

  async handleCallback(payload) {
    const env = getEnv();
    const expectedHash = this.generateHash(
      {
        storeId: payload.storeId,
        amount: payload.amount,
        postBackURL: payload.postBackURL,
        orderRefNum: payload.orderRefNum,
      },
      env.EASYPAISA_HASH_KEY
    );

    if (payload.merchantHashedReq !== expectedHash) {
      return { success: false, verified: false, error: "Invalid hash" };
    }

    const success = payload.status === "Paid" || payload.responseCode === "0000";
    return {
      success,
      verified: true,
      paymentStatus: success ? "paid" : "failed",
      orderStatus: success ? "paid" : "awaiting_payment",
      reference: payload.transactionId,
      orderNumber: payload.orderRefNum,
    };
  },

  async verifyPayment(payload) {
    return this.handleCallback(payload);
  },
};
