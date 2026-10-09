import { getEasypaisaConfig } from "@/lib/settings";
import { codProvider } from "./cod.provider";
import { easypaisaProvider } from "./easypaisa.provider";
import { jazzcashProvider } from "./jazzcash.provider";

/**
 * Payment methods the store supports:
 *  - cod       → Cash on Delivery
 *  - easypaisa → manual transfer, confirmed by the seller from the TrxID
 *  - jazzcash  → JazzCash HTTP POST page redirect (when credentials are set)
 */
const providers = {
  cod: codProvider,
  easypaisa: easypaisaProvider,
  jazzcash: jazzcashProvider,
};

/** What customers can actually pick at checkout (when each is configured). */
const CHECKOUT_METHODS = ["cod", "easypaisa", "jazzcash"];

export function getPaymentProvider(method) {
  const provider = providers[method];
  if (!provider) throw new Error(`Unknown payment method: ${method}`);
  return provider;
}

export async function getAvailablePaymentMethodsAsync() {
  try {
    const codOnly = process.env.CHECKOUT_COD_ONLY === "true";
    const account = await getEasypaisaConfig();
    const easyPaisaReady = !!(account.accountTitle && account.accountNumber);
    const jazzcashReady = jazzcashProvider.isConfigured();

    const methods = [
      {
        id: codProvider.id,
        labelEn: codProvider.labelEn,
        labelUr: codProvider.labelUr,
        descriptionEn: codProvider.descriptionEn,
        descriptionUr: codProvider.descriptionUr,
      },
    ];

    if (!codOnly && easyPaisaReady) {
      methods.push({
        id: easypaisaProvider.id,
        labelEn: easypaisaProvider.labelEn,
        labelUr: easypaisaProvider.labelUr,
        descriptionEn: easypaisaProvider.descriptionEn,
        descriptionUr: easypaisaProvider.descriptionUr,
        accountTitle: account.accountTitle,
        accountNumber: account.accountNumber,
      });
    }

    if (!codOnly && jazzcashReady) {
      methods.push({
        id: jazzcashProvider.id,
        labelEn: jazzcashProvider.labelEn,
        labelUr: jazzcashProvider.labelUr,
        descriptionEn: jazzcashProvider.descriptionEn,
        descriptionUr: jazzcashProvider.descriptionUr,
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
