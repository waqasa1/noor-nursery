/**
 * DISABLED — JazzCash Merchant Payment Portal (automatic gateway).
 *
 * We no longer use HTTP POST redirects / merchant callbacks.
 * Checkout uses manual JazzCash Send Money + customer TID/TrxID instead
 * (see jazzcash.provider.js).
 *
 * To re-enable: restore initiate/handleCallback bodies from git history,
 * register this provider in lib/payments/index.js, and restore
 * app/api/jazzcash/return/route.js callback handling.
 */

import { buildPaymentPortalSecureHash } from "@/lib/payments/jazzcash-hash";

/** JazzCash bill ref: alphanumeric + dot only (no hyphens). Max 20 chars. */
export function jazzCashBillReference(orderNumber) {
  return String(orderNumber)
    .replace(/[^a-zA-Z0-9.]/g, "")
    .slice(0, 20);
}

/** Map gateway fields back to our order number (ppmpf_1 keeps the full NN-… id). */
export function resolveOrderNumberFromJazzCashPayload(payload) {
  const candidates = [payload?.ppmpf_1, payload?.pp_BillReference]
    .map((v) => String(v || "").trim())
    .filter(Boolean);

  for (const value of candidates) {
    if (/^NN-/i.test(value)) return value;
    const restored = value.match(/^NN(\d{6})([A-Z0-9]+)$/i);
    if (restored) return `NN-${restored[1]}-${restored[2]}`;
  }

  return candidates[0] || null;
}

/** @deprecated use buildPaymentPortalSecureHash from jazzcash-hash.js */
export function buildJazzCashSecureHash(params, integritySalt, version = "1.1") {
  return buildPaymentPortalSecureHash(params, integritySalt, version);
}

/**
 * Merchant gateway provider — NOT registered for checkout.
 * @type {import('./types').PaymentProvider}
 */
export const jazzcashMerchantProvider = {
  id: "jazzcash_merchant",
  labelEn: "JazzCash (Merchant — disabled)",
  labelUr: "جاز کیش مرچنٹ (غیر فعال)",
  descriptionEn: "Automatic JazzCash portal (disabled)",
  descriptionUr: "خودکار جاز کیش (غیر فعال)",

  isConfigured() {
    return false;
  },

  async initiate() {
    return { success: false, error: "JazzCash merchant gateway is disabled" };
  },

  async handleCallback() {
    return {
      success: false,
      verified: false,
      error: "JazzCash merchant gateway is disabled",
    };
  },

  async verifyPayment(payload) {
    return this.handleCallback(payload);
  },
};
