/**
 * Legacy EasyPaisa manual provider — no longer offered at checkout.
 * Kept so existing orders with paymentMethod "easypaisa" still resolve.
 * New prepaid wallet orders use jazzcash (manual Send Money + TID).
 *
 * @type {import('./types').PaymentProvider}
 */
export const easypaisaProvider = {
  id: "easypaisa",
  labelEn: "EasyPaisa (legacy)",
  labelUr: "EasyPaisa",
  descriptionEn: "Legacy EasyPaisa transfer",
  descriptionUr: "EasyPaisa",

  isConfigured() {
    return false;
  },

  async initiate() {
    return { success: false, error: "EasyPaisa is no longer offered; use JazzCash Send Money" };
  },

  async handleCallback() {
    return { success: false, verified: false, error: "EasyPaisa is verified manually by the seller" };
  },

  async verifyPayment(payload) {
    return this.handleCallback(payload);
  },
};
