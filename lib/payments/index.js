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

export async function getAvailablePaymentMethodsAsync() {
  const bank = await getBankConfig();
  const bankConfigured = !!(bank.accountNumber && bank.accountTitle);

  return Object.entries(providers)
    .filter(([method]) => {
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
}

export { providers };
