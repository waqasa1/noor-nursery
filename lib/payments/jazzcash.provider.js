import { getJazzCashWalletConfig } from "@/lib/settings";

/**
 * JazzCash — MANUAL wallet transfer (no merchant gateway).
 *
 * Customer places the order, sends the exact total via JazzCash Send Money
 * (*786# / app), then submits the Transaction ID (TID / TrxID) from the
 * confirmation SMS. Seller verifies that TID in their JazzCash app before
 * marking paid.
 *
 * @type {import('./types').PaymentProvider}
 */
export const jazzcashProvider = {
  id: "jazzcash",
  labelEn: "JazzCash (Send Money)",
  labelUr: "جاز کیش (سینڈ منی)",
  descriptionEn: "Pay first from your JazzCash app — order ships after we verify your transfer",
  descriptionUr: "اپنی جاز کیش ایپ سے پہلے ادائیگی کریں — تصدیق کے بعد آرڈر بھیجا جائے گا",

  isConfigured() {
    return true;
  },

  async getAccount() {
    return getJazzCashWalletConfig();
  },

  async initiate() {
    const account = await this.getAccount();
    if (!account.accountNumber || !account.accountTitle) {
      return { success: false, error: "JazzCash account details are not configured" };
    }

    return {
      success: true,
      manual: true,
      paymentStatus: "pending",
      orderStatus: "awaiting_payment",
      formAction: null,
      redirectUrl: null,
      account,
    };
  },

  async handleCallback() {
    return {
      success: false,
      verified: false,
      error: "JazzCash is verified manually by the seller (TID / TrxID)",
    };
  },

  async verifyPayment(payload) {
    return this.handleCallback(payload);
  },
};

// Re-export merchant helpers for any leftover imports / tests
export {
  jazzCashBillReference,
  resolveOrderNumberFromJazzCashPayload,
  buildJazzCashSecureHash,
} from "./jazzcash.merchant";
