import { getEasypaisaConfig } from "@/lib/settings";

/**
 * EasyPaisa — MANUAL wallet transfer (no gateway).
 *
 * Flow: the customer places the order, sends the exact total from their own
 * EasyPaisa app to our account, then submits the transaction ID (TrxID) on the
 * order confirmation page. The order only moves to "paid" once the seller
 * confirms that TrxID inside their own EasyPaisa app — never from a screenshot.
 *
 * @type {import('./types').PaymentProvider}
 */
export const easypaisaProvider = {
  id: "easypaisa",
  labelEn: "EasyPaisa (Send Money)",
  labelUr: "EasyPaisa (سینڈ منی)",
  descriptionEn: "Pay first from your EasyPaisa app — order ships after we verify your transfer",
  descriptionUr: "اپنی EasyPaisa ایپ سے پہلے ادائیگی کریں — تصدیق کے بعد آرڈر بھیجا جائے گا",

  isConfigured() {
    return true; // manual transfer always possible once account details exist
  },

  /** Account title + number the customer must send money to. */
  async getAccount() {
    return getEasypaisaConfig();
  },

  async initiate({ order }) {
    const account = await this.getAccount();
    if (!account.accountNumber || !account.accountTitle) {
      return { success: false, error: "EasyPaisa account details are not configured" };
    }

    return {
      success: true,
      manual: true,
      paymentStatus: "pending",
      orderStatus: "awaiting_payment",
      formAction: null,
      redirectUrl: null,
      account,
      amount: order.total,
      orderNumber: order.orderNumber,
    };
  },

  /**
   * Manual transfers have no gateway callback — the seller verifies the TrxID
   * in the EasyPaisa app, so an unverified callback must never mark paid.
   */
  async handleCallback() {
    return { success: false, verified: false, error: "EasyPaisa is verified manually by the seller" };
  },

  async verifyPayment(payload) {
    return this.handleCallback(payload);
  },
};
