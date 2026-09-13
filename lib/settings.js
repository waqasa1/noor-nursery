import StoreSettings from "@/models/StoreSettings";
import { connectDB, isDBConfigured } from "@/lib/db";
import { getEnv } from "@/lib/env";

const DEFAULT_CITY_FEES = {
  lahore: 150,
  karachi: 300,
  islamabad: 250,
  rawalpindi: 250,
  faisalabad: 200,
  multan: 200,
};

export async function getSetting(key, fallback = null) {
  if (!isDBConfigured()) return fallback;
  await connectDB();
  const doc = await StoreSettings.findOne({ key }).lean();
  return doc?.value ?? fallback;
}

export async function setSetting(key, value) {
  await connectDB();
  return StoreSettings.findOneAndUpdate(
    { key },
    { value },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
}

export async function getAllSettings() {
  if (!isDBConfigured()) return {};
  await connectDB();
  const docs = await StoreSettings.find().lean();
  return Object.fromEntries(docs.map((d) => [d.key, d.value]));
}

export async function getDeliveryConfig() {
  const env = getEnv();
  const stored = await getSetting("delivery", null);
  return {
    defaultFee: stored?.defaultFee ?? env.DEFAULT_DELIVERY_FEE ?? 250,
    freeThreshold: stored?.freeThreshold ?? env.FREE_DELIVERY_THRESHOLD ?? 2500,
    cityFees: { ...DEFAULT_CITY_FEES, ...(stored?.cityFees || {}) },
  };
}

export async function getStoreInfo() {
  const env = getEnv();
  const stored = await getSetting("store", null);
  return {
    name: stored?.name ?? env.NEXT_PUBLIC_STORE_NAME ?? "Noor Nursery",
    phone: stored?.phone ?? env.NEXT_PUBLIC_STORE_PHONE ?? "",
    email: stored?.email ?? env.NEXT_PUBLIC_STORE_EMAIL ?? "",
    address: stored?.address ?? env.NEXT_PUBLIC_STORE_ADDRESS ?? "",
  };
}

export async function getBankConfig() {
  const env = getEnv();
  const stored = await getSetting("bank", null);
  return {
    accountTitle: stored?.accountTitle ?? env.BANK_ACCOUNT_TITLE ?? "",
    accountNumber: stored?.accountNumber ?? env.BANK_ACCOUNT_NUMBER ?? "",
    bankName: stored?.bankName ?? env.BANK_NAME ?? "",
    branch: stored?.branch ?? env.BANK_BRANCH ?? "",
  };
}

export async function getPromoCodes() {
  const stored = await getSetting("promo_codes", null);
  if (stored) return stored;
  return {
    NOOR20: {
      code: "NOOR20",
      type: "percent",
      value: 20,
      minSubtotal: 0,
      active: true,
      label: "20% off your order",
    },
  };
}
