import { getJazzCashWalletConfig } from "@/lib/settings";
import { codProvider } from "./cod.provider";
import { easypaisaProvider } from "./easypaisa.provider";
import { jazzcashProvider } from "./jazzcash.provider";

/**
 * Payment methods:
 *  - cod      → Cash on Delivery
 *  - jazzcash → manual JazzCash Send Money + TID/TrxID (seller verifies in app)
 *
 * Merchant JazzCash portal is disabled (see jazzcash.merchant.js).
 * easypaisa remains registered only for legacy orders.
 */
const providers = {
  cod: codProvider,
  jazzcash: jazzcashProvider,
  easypaisa: easypaisaProvider,
};

/** What customers can pick at checkout. */
const CHECKOUT_METHODS = ["cod", "jazzcash"];

export function getPaymentProvider(method) {
  const provider = providers[method];
  if (!provider) throw new Error(`Unknown payment method: ${method}`);
  return provider;
}

export async function getAvailablePaymentMethodsAsync() {
  try {
    const codOnly = process.env.CHECKOUT_COD_ONLY === "true";
    const account = await getJazzCashWalletConfig();
    const jazzcashReady = !!(account.accountTitle && account.accountNumber);

    const methods = [
      {
        id: codProvider.id,
        labelEn: codProvider.labelEn,
        labelUr: codProvider.labelUr,
        descriptionEn: codProvider.descriptionEn,
        descriptionUr: codProvider.descriptionUr,
      },
    ];

    if (!codOnly && jazzcashReady) {
      methods.push({
        id: jazzcashProvider.id,
        labelEn: jazzcashProvider.labelEn,
        labelUr: jazzcashProvider.labelUr,
        descriptionEn: jazzcashProvider.descriptionEn,
        descriptionUr: jazzcashProvider.descriptionUr,
        accountTitle: account.accountTitle,
        accountNumber: account.accountNumber,
      });
    }

    return methods.filter((m) => CHECKOUT_METHODS.includes(m.id));
  } catch {
    return [
      {
        id: codProvider.id,
        labelEn: codProvider.labelEn,
        labelUr: codProvider.labelUr,
        descriptionEn: codProvider.descriptionEn,
        descriptionUr: codProvider.descriptionUr,
      },
    ];
  }
}

export { providers, CHECKOUT_METHODS };
