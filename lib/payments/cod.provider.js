/** @type {import('./types').PaymentProvider} */
export const codProvider = {
  id: "cod",
  labelEn: "Cash on Delivery",
  labelUr: "کیش آن ڈیلیوری",
  descriptionEn: "Pay when your plants arrive at your doorstep",
  descriptionUr: "پودے پہنچنے پر ادائیگی کریں",

  async initiate({ order }) {
    return {
      success: true,
      paymentStatus: "unpaid",
      orderStatus: "pending",
      redirectUrl: `/order-success/${order.orderNumber}`,
      message: "Order placed. Pay on delivery.",
    };
  },

  async handleCallback() {
    return { success: false, message: "COD does not use callbacks" };
  },

  async verifyPayment() {
    return { verified: false };
  },
};
