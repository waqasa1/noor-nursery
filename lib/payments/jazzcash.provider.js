import crypto from "crypto";
import { getEnv } from "@/lib/env";

const SANDBOX_FORM =
  "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";
const PRODUCTION_FORM =
  "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

function formatJazzCashDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

function getJazzCashConfig() {
  const env = getEnv();
  const merchantId = process.env.JAZZCASH_MERCHANT_ID || env.JAZZCASH_MERCHANT_ID;
  const password = process.env.JAZZCASH_PASSWORD || env.JAZZCASH_PASSWORD;
  const integritySalt =
    process.env.JAZZCASH_INTEGRITY_SALT || env.JAZZCASH_INTEGRITY_SALT;
  const returnUrl =
    process.env.JAZZCASH_RETURN_URL ||
    env.JAZZCASH_RETURN_URL ||
    `${env.NEXT_PUBLIC_APP_URL}/api/jazzcash/return`;
  const isProduction =
    (process.env.JAZZCASH_ENV || env.JAZZCASH_ENV || "sandbox").toLowerCase() ===
    "production";

  return { merchantId, password, integritySalt, returnUrl, isProduction };
}

/**
 * JazzCash HMAC-SHA256: Integrity Salt + "&" + alphabetically sorted non-empty
 * field values (excluding pp_SecureHash), hex-encoded uppercase.
 */
export function buildJazzCashSecureHash(params, integritySalt) {
  const sortedValues = Object.keys(params)
    .filter((key) => key !== "pp_SecureHash")
    .filter((key) => {
      const value = params[key];
      return value !== undefined && value !== null && String(value).length > 0;
    })
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .map((key) => String(params[key]));

  const message = [integritySalt, ...sortedValues].join("&");
  return crypto.createHmac("sha256", integritySalt).update(message, "utf8").digest("hex").toUpperCase();
}

/** @type {import('./types').PaymentProvider} */
export const jazzcashProvider = {
  id: "jazzcash",
  labelEn: "JazzCash",
  labelUr: "جاز کیش",
  descriptionEn: "Pay securely via JazzCash (wallet, card, or voucher)",
  descriptionUr: "جاز کیش سے محفوظ ادائیگی",

  isConfigured() {
    const { merchantId, password, integritySalt } = getJazzCashConfig();
    return !!(merchantId && password && integritySalt);
  },

  async initiate({ order }) {
    const config = getJazzCashConfig();
    if (!config.merchantId || !config.password || !config.integritySalt) {
      return { success: false, error: "JazzCash is not configured" };
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const txnDateTime = formatJazzCashDate(now);

    const params = {
      pp_Amount: String(Math.round(Number(order.total) * 100)),
      pp_BillReference: order.orderNumber,
      pp_Description: `Noor Nursery Order ${order.orderNumber}`.slice(0, 200),
      pp_Language: "EN",
      pp_MerchantID: config.merchantId,
      pp_Password: config.password,
      pp_ReturnURL: config.returnUrl,
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: txnDateTime,
      pp_TxnExpiryDateTime: formatJazzCashDate(expiry),
      pp_TxnRefNo: `T${Date.now()}`,
      pp_TxnType: "MWALLET",
      pp_Version: "1.1",
      ppmpf_1: order.orderNumber,
    };

    params.pp_SecureHash = buildJazzCashSecureHash(params, config.integritySalt);

    return {
      success: true,
      paymentStatus: "pending",
      orderStatus: "awaiting_payment",
      formAction: config.isProduction ? PRODUCTION_FORM : SANDBOX_FORM,
      formParams: params,
      redirectUrl: null,
    };
  },

  async handleCallback(payload) {
    const config = getJazzCashConfig();
    if (!config.integritySalt) {
      return { success: false, verified: false, error: "JazzCash is not configured" };
    }

    const provided = payload?.pp_SecureHash;
    if (!provided) {
      return { success: false, verified: false, error: "Missing secure hash" };
    }

    const expected = buildJazzCashSecureHash(payload, config.integritySalt);
    if (expected.toLowerCase() !== String(provided).toLowerCase()) {
      return { success: false, verified: false, error: "Invalid signature" };
    }

    const success = payload.pp_ResponseCode === "000";
    const orderNumber = payload.pp_BillReference || payload.ppmpf_1;

    return {
      success,
      verified: true,
      paymentStatus: success ? "paid" : "failed",
      orderStatus: success ? "paid" : "awaiting_payment",
      reference: payload.pp_TxnRefNo || payload.pp_RetreivalReferenceNo,
      orderNumber,
      message: payload.pp_ResponseMessage || null,
    };
  },

  async verifyPayment(payload) {
    return this.handleCallback(payload);
  },
};
