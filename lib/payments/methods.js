/** Manual JazzCash Send Money + TID (checkout prepaid method). */
export const MANUAL_WALLET_METHODS = new Set(["jazzcash"]);

export function isManualWalletPayment(method) {
  return method === "jazzcash";
}

/** Customer-facing payment label. */
export function paymentMethodLabel(method) {
  if (method === "cod") return "Cash on Delivery";
  if (method === "jazzcash") return "JazzCash (Send Money)";
  return method || "—";
}
