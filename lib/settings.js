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
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
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

/**
 * Manual JazzCash wallet the customer Send-Money’s to (Admin Settings).
 * Reuses the stored `easypaisa` settings key so existing account details keep working.
 */
export async function getJazzCashWalletConfig() {
  const stored =
    (await getSetting("jazzcash", null)) || (await getSetting("easypaisa", null));
  return {
    accountTitle:
      stored?.accountTitle ??
      process.env.JAZZCASH_ACCOUNT_TITLE ??
      process.env.EASYPAISA_ACCOUNT_TITLE ??
      "",
    accountNumber:
      stored?.accountNumber ??
      process.env.JAZZCASH_ACCOUNT_NUMBER ??
      process.env.EASYPAISA_ACCOUNT_NUMBER ??
      "",
  };
}

/** @deprecated use getJazzCashWalletConfig — same wallet account, JazzCash branding */
export async function getEasypaisaConfig() {
  return getJazzCashWalletConfig();
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

export async function getBannerConfig() {
  const stored = await getSetting("banner", null);
  return {
    active: stored?.active ?? true,
    text: stored?.text ?? "Limited offer:",
    subtext: stored?.subtext ?? "Flat 20% off your order — free shipping over PKR 2,500",
    code: stored?.code ?? "NOOR20",
  };
}

export async function getSiteContent() {
  const stored = await getSetting("site_content", null);
  return {
    heroImage: stored?.heroImage ?? "",
    indoorImage: stored?.indoorImage ?? "",
    aboutImage: stored?.aboutImage ?? "",
    facebookUrl: stored?.facebookUrl ?? "https://www.facebook.com/Noor.Nursery.24hr",
    instagramUrl: stored?.instagramUrl ?? "https://www.instagram.com/noornursery_official/",
    copyrightText: stored?.copyrightText ?? "Noor Nursery Pakistan. All rights reserved.",
  };
}
