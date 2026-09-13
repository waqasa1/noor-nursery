import { getEnv } from "./env";
import { getDeliveryConfig } from "./settings";

const CITY_FEES = {
  lahore: 150,
  karachi: 300,
  islamabad: 250,
  rawalpindi: 250,
  faisalabad: 200,
  multan: 200,
};

export function calculateDeliveryFee(city, subtotal, config = null) {
  const env = getEnv();
  const defaultFee = config?.defaultFee ?? env.DEFAULT_DELIVERY_FEE ?? 250;
  const freeThreshold = config?.freeThreshold ?? env.FREE_DELIVERY_THRESHOLD ?? 2500;
  const cityFees = config?.cityFees ?? CITY_FEES;

  if (subtotal >= freeThreshold) return 0;

  const normalizedCity = String(city || "").trim().toLowerCase();
  return cityFees[normalizedCity] ?? defaultFee;
}

export async function calculateDeliveryFeeAsync(city, subtotal) {
  const config = await getDeliveryConfig();
  return calculateDeliveryFee(city, subtotal, config);
}

export function getDeliveryInfo() {
  const env = getEnv();
  return {
    defaultFee: env.DEFAULT_DELIVERY_FEE || 250,
    freeThreshold: env.FREE_DELIVERY_THRESHOLD || 2500,
    cityFees: CITY_FEES,
  };
}
