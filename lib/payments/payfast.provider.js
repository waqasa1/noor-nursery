import crypto from "crypto";
import { getEnv } from "@/lib/env";

/** @type {import('./types').PaymentProvider} */
export const payfastProvider = {
  id: "payfast",
  labelEn: "PayFast (Card / Online)",
  labelUr: "PayFast (کارڈ / آن لائن)",
  descriptionEn: "Pay with debit/credit card via PayFast",
  descriptionUr: "PayFast کے ذریعے ڈیبٹ/کریڈٹ کارڈ سے ادائیگی",

  isConfigured() {
    const env = getEnv();
    return !!(env.PAYFAST_MERCHANT_ID && env.PAYFAST_MERCHANT_KEY && env.PAYFAST_SECRET);
  },

  generateSignature(params, secret) {
    const sorted = Object.keys(params)
      .sort()
      .map((k) => `${k}=${encodeURIComponent(params[k])}`)
      .join("&");
    return crypto.createHash("md5").update(sorted + secret).digest("hex");
  },

  async initiate({ order }) {
    const env = getEnv();
    if (!this.isConfigured()) {
      return { success: false, error: "PayFast is not configured" };
    }

    const params = {
      merchant_id: env.PAYFAST_MERCHANT_ID,
      merchant_key: env.PAYFAST_MERCHANT_KEY,
      return_url: env.PAYFAST_RETURN_URL,
      cancel_url: env.PAYFAST_CANCEL_URL,
      notify_url: env.PAYFAST_NOTIFY_URL,
      name_first: order.customer.name.split(" ")[0] || "Customer",
      name_last: order.customer.name.split(" ").slice(1).join(" ") || "Noor",
      email_address: order.customer.email,
      m_payment_id: order.orderNumber,
      amount: order.total.toFixed(2),
      item_name: `Noor Nursery Order ${order.orderNumber}`,
    };

    params.signature = this.generateSignature(params, env.PAYFAST_SECRET);

    return {
      success: true,
      paymentStatus: "pending",
      orderStatus: "awaiting_payment",
      formAction: "https://www.payfast.co.za/eng/process",
      formParams: params,
      redirectUrl: null,
    };
  },

  async handleCallback(payload) {
    const env = getEnv();
    const { signature, ...rest } = payload;
    const computed = this.generateSignature(rest, env.PAYFAST_SECRET);

    if (signature !== computed) {
      return { success: false, verified: false, error: "Invalid signature" };
    }

    const success = payload.payment_status === "COMPLETE";
    return {
      success,
      verified: true,
      paymentStatus: success ? "paid" : "failed",
      orderStatus: success ? "paid" : "awaiting_payment",
      reference: payload.pf_payment_id,
      orderNumber: payload.m_payment_id,
    };
  },

  async verifyPayment(payload) {
    return this.handleCallback(payload);
  },
};
