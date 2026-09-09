import { isPaymentConfigured } from "@/lib/env";
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

export { providers };
