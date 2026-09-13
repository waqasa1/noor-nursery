import { isPaymentConfigured } from "@/lib/env";
import { getBankConfig } from "@/lib/settings";
import { codProvider } from "./cod.provider";
import { bankTransferProvider } from "./bank-transfer.provider";
import { jazzcashProvider } from "./jazzcash.provider";
import { easypaisaProvider } from "./easypaisa.provider";
import { payfastProvider } from "./payfast.provider";

const providers = {
  cod: codProvider,
  bank_transfer: bankTransferProvider,
  jazzcash: jazzcashProvider,
  easypaisa: easypaisaProvider,
  payfast: payfastProvider,
};

export function getPaymentProvider(method) {
  const provider = providers[method];
  if (!provider) throw new Error(`Unknown payment method: ${method}`);
  return provider;
}

export function getAvailablePaymentMethods() {
  return Object.entries(providers)
    .filter(([method]) => isPaymentConfigured(method))
    .map(([method, provider]) => ({
      id: method,
      labelEn: provider.labelEn,
      labelUr: provider.labelUr,
      descriptionEn: provider.descriptionEn,
      descriptionUr: provider.descriptionUr,
    }));
}

const codMethod = {
  id: codProvider.id,
  labelEn: codProvider.labelEn,
  labelUr: codProvider.labelUr,
  descriptionEn: codProvider.descriptionEn,
  descriptionUr: codProvider.descriptionUr,
};

export async function getAvailablePaymentMethodsAsync() {
  try {
    const bank = await getBankConfig();
    const bankConfigured = !!(bank.accountNumber && bank.accountTitle);
    const codOnly = process.env.CHECKOUT_COD_ONLY === "true";

    const methods = Object.entries(providers)
      .filter(([method]) => {
        if (codOnly) return method === "cod";
        if (method === "bank_transfer") {
          return bankConfigured || isPaymentConfigured(method);
        }
        return isPaymentConfigured(method);
      })
      .map(([method, provider]) => ({
        id: method,
        labelEn: provider.labelEn,
        labelUr: provider.labelUr,
        descriptionEn: provider.descriptionEn,
        descriptionUr: provider.descriptionUr,
      }));

    return methods.some((m) => m.id === "cod") ? methods : [codMethod, ...methods];
  } catch {
    return [codMethod];
  }
}

export { providers };
