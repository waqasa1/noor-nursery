import { getEnv } from "@/lib/env";
import {
  buildPaymentPortalSecureHash,
  verifyPaymentPortalSecureHash,
} from "@/lib/payments/jazzcash-hash";

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
  const rawTxnType = (process.env.JAZZCASH_TXN_TYPE || env.JAZZCASH_TXN_TYPE || "").trim();
  const txnType =
    rawTxnType && !/^(none|unset|empty|-)$/i.test(rawTxnType) ? rawTxnType : "";
  const portalVersion =
    (process.env.JAZZCASH_PORTAL_VERSION || env.JAZZCASH_PORTAL_VERSION || "1.1").trim();

  return {
    merchantId,
    password,
    integritySalt,
    returnUrl,
    isProduction,
    txnType,
    portalVersion,
  };
}

/** JazzCash bill ref: alphanumeric + dot only (no hyphens). Max 20 chars. */
export function jazzCashBillReference(orderNumber) {
  return String(orderNumber)
    .replace(/[^a-zA-Z0-9.]/g, "")
    .slice(0, 20);
}

/** Map gateway fields back to our order number (ppmpf_1 keeps the full NN-… id). */
export function resolveOrderNumberFromJazzCashPayload(payload) {
  const mpf = payload?.ppmpf_1?.trim();
  if (mpf && /^NN-/i.test(mpf)) return mpf;

  const bill = payload?.pp_BillReference?.trim();
  if (!bill) return null;
  if (/^NN-/i.test(bill)) return bill;

  const restored = bill.match(/^NN(\d{6})([A-Z0-9]+)$/i);
  if (restored) return `NN-${restored[1]}-${restored[2]}`;

  return bill;
}

/** @deprecated use buildPaymentPortalSecureHash from jazzcash-hash.js */
export function buildJazzCashSecureHash(params, integritySalt, version = "1.1") {
  return buildPaymentPortalSecureHash(params, integritySalt, version);
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
    const billReference = jazzCashBillReference(order.orderNumber);
    const version = config.portalVersion === "2.0" ? "2.0" : "1.1";

    const params = {
      pp_Amount: String(Math.round(Number(order.total) * 100)),
      pp_BillReference: billReference,
      pp_Description: `Description of transaction`.slice(0, 200),
      pp_Language: "EN",
      pp_MerchantID: config.merchantId,
      pp_Password: config.password,
      pp_ReturnURL: config.returnUrl,
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: txnDateTime,
      pp_TxnExpiryDateTime: formatJazzCashDate(expiry),
      pp_TxnRefNo: `T${txnDateTime}`,
      pp_Version: version,
      ppmpf_1: order.orderNumber,
    };

    if (version === "2.0") {
      params.pp_IsRegisteredCustomer = "No";
      if (order.customer?.email) params.pp_CustomerEmail = order.customer.email;
      if (order.customer?.phone) params.pp_CustomerMobile = order.customer.phone;
    }

    if (config.txnType) {
      params.pp_TxnType = config.txnType;
    }

    const pp_SecureHash = buildPaymentPortalSecureHash(
      params,
      config.integritySalt,
      version
    );

    // Match sandbox HTML form: send the same field names (including empty ones).
    const formParams = {
      pp_Version: params.pp_Version,
      pp_TxnType: params.pp_TxnType ?? "",
      pp_MerchantID: params.pp_MerchantID,
      pp_Language: params.pp_Language,
      pp_SubMerchantID: "",
      pp_Password: params.pp_Password,
      pp_TxnRefNo: params.pp_TxnRefNo,
      pp_Amount: params.pp_Amount,
      pp_DiscountedAmount: "",
      pp_DiscountBank: "",
      pp_TxnCurrency: params.pp_TxnCurrency,
      pp_TxnDateTime: params.pp_TxnDateTime,
      pp_TxnExpiryDateTime: params.pp_TxnExpiryDateTime,
      pp_BillReference: params.pp_BillReference,
      pp_Description: params.pp_Description,
      pp_ReturnURL: params.pp_ReturnURL,
      pp_SecureHash,
      ppmpf_1: params.ppmpf_1,
      ppmpf_2: "",
      ppmpf_3: "",
      ppmpf_4: "",
      ppmpf_5: "",
    };

    if (version === "2.0") {
      formParams.pp_IsRegisteredCustomer = params.pp_IsRegisteredCustomer ?? "No";
      formParams.pp_TokenizedCardNumber = params.pp_TokenizedCardNumber ?? "";
      formParams.pp_CustomerID = params.pp_CustomerID ?? "";
      formParams.pp_CustomerEmail = params.pp_CustomerEmail ?? "";
      formParams.pp_CustomerMobile = params.pp_CustomerMobile ?? "";
    }

    return {
      success: true,
      paymentStatus: "pending",
      orderStatus: "awaiting_payment",
      formAction: config.isProduction ? PRODUCTION_FORM : SANDBOX_FORM,
      formParams,
      redirectUrl: null,
    };
  },

  async handleCallback(payload) {
    const config = getJazzCashConfig();
    if (!config.integritySalt) {
      return { success: false, verified: false, error: "JazzCash is not configured" };
    }

    const version =
      payload?.pp_Version === "2.0" ? "2.0" : config.portalVersion === "2.0" ? "2.0" : "1.1";

    if (!verifyPaymentPortalSecureHash(payload, config.integritySalt, version)) {
      return { success: false, verified: false, error: "Invalid signature" };
    }

    const success = payload.pp_ResponseCode === "000";
    const orderNumber = resolveOrderNumberFromJazzCashPayload(payload);

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
