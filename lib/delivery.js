import { getEnv } from "./env";

const CITY_FEES = {
  lahore: 150,
  karachi: 300,
  islamabad: 250,
  rawalpindi: 250,
  faisalabad: 200,
  multan: 200,
};

export function calculateDeliveryFee(city, subtotal) {
  const env = getEnv();
  const defaultFee = env.DEFAULT_DELIVERY_FEE || 250;
  const freeThreshold = env.FREE_DELIVERY_THRESHOLD || 2500;

  if (subtotal >= freeThreshold) return 0;

  const normalizedCity = String(city || "").trim().toLowerCase();
  return CITY_FEES[normalizedCity] ?? defaultFee;
}

export function getDeliveryInfo() {
  const env = getEnv();
  return {
    defaultFee: env.DEFAULT_DELIVERY_FEE || 250,
    freeThreshold: env.FREE_DELIVERY_THRESHOLD || 2500,
    cityFees: CITY_FEES,
  };
}
