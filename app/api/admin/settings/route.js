import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import {
  getAllSettings,
  setSetting,
  getDeliveryConfig,
  getStoreInfo,
  getBankConfig,
  getJazzCashWalletConfig,
  setJazzCashWalletConfig,
  getPromoCodes,
  getBannerConfig,
  getSiteContent,
} from "@/lib/settings";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const jazzcashWalletSchema = z.object({
  accountTitle: z.string().max(80).optional(),
  accountNumber: z.string().max(30).optional(),
});

const updateSchema = z.object({
  delivery: z.object({
    defaultFee: z.number().min(0),
    freeThreshold: z.number().min(0),
    cityFees: z.record(z.number()).optional(),
  }).optional(),
  store: z.object({
    name: z.string().min(1),
    phone: z.string().optional(),
    email: z.preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.string().email().optional()
    ),
    address: z.string().optional(),
  }).optional(),
  bank: z.object({
    accountTitle: z.string().optional(),
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    branch: z.string().optional(),
  }).optional(),
  jazzcash: jazzcashWalletSchema.optional(),
  promo_codes: z.record(z.object({
    code: z.string(),
    type: z.enum(["percent", "fixed"]),
    value: z.number().min(0),
    minSubtotal: z.number().min(0).optional(),
    active: z.boolean(),
    label: z.string().optional(),
  })).optional(),
  banner: z.object({
    active: z.boolean(),
    text: z.string().max(120),
    subtext: z.string().max(240),
    code: z.string().max(40),
  }).optional(),
  site_content: z.object({
    heroImage: z.string().optional(),
    indoorImage: z.string().optional(),
    aboutImage: z.string().optional(),
    facebookUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
    copyrightText: z.string().max(200).optional(),
  }).optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    const [delivery, store, bank, jazzcash, promo_codes, banner, site_content, raw] = await Promise.all([
      getDeliveryConfig(),
      getStoreInfo(),
      getBankConfig(),
      getJazzCashWalletConfig(),
      getPromoCodes(),
      getBannerConfig(),
      getSiteContent(),
      getAllSettings(),
    ]);
    return jsonSuccess({ delivery, store, bank, jazzcash, promo_codes, banner, site_content, raw });
  } catch (error) {
    return handleApiError(error);
  }
}

function normalizePromoCode(raw) {
  return String(raw || "").trim().toUpperCase();
}

/** Ensure checkout promo uses the Flash Deal banner code. */
function syncPromoCodesWithBanner(promoCodes, banner) {
  const code = normalizePromoCode(banner?.code);
  if (!code) return promoCodes;

  const existing =
    promoCodes?.[code] ||
    Object.values(promoCodes || {}).find(
      (p) => normalizePromoCode(p?.code) === code
    ) ||
    Object.values(promoCodes || {})[0] ||
    {};

  const value = Number(existing.value ?? 20);
  return {
    [code]: {
      code,
      type: existing.type === "fixed" ? "fixed" : "percent",
      value: Number.isFinite(value) ? value : 20,
      minSubtotal: Number(existing.minSubtotal ?? 0),
      active: existing.active ?? true,
      label: existing.label || `${Number.isFinite(value) ? value : 20}% off your order`,
    },
  };
}

export async function PUT(request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      const first =
        parsed.error.issues?.[0]?.message || "Validation failed";
      return jsonError(first, 400, parsed.error.flatten());
    }

    const data = { ...parsed.data };
    if (data.banner) {
      data.banner = {
        ...data.banner,
        code: normalizePromoCode(data.banner.code),
      };
      data.promo_codes = syncPromoCodesWithBanner(
        data.promo_codes || (await getPromoCodes()),
        data.banner
      );
    } else if (data.promo_codes) {
      // Keep keys uppercase and code field in sync
      data.promo_codes = Object.fromEntries(
        Object.entries(data.promo_codes).map(([key, promo]) => {
          const code = normalizePromoCode(promo.code || key);
          return [code, { ...promo, code }];
        })
      );
    }

    const updates = [];
    if (data.delivery) updates.push(setSetting("delivery", data.delivery));
    if (data.store) updates.push(setSetting("store", data.store));
    if (data.bank) updates.push(setSetting("bank", data.bank));
    if (data.jazzcash) updates.push(setJazzCashWalletConfig(data.jazzcash));
    if (data.promo_codes) updates.push(setSetting("promo_codes", data.promo_codes));
    if (data.banner) updates.push(setSetting("banner", data.banner));
    if (data.site_content) updates.push(setSetting("site_content", data.site_content));

    await Promise.all(updates);
    const { revalidateSiteSettings } = await import("@/lib/cache/site-settings");
    revalidateSiteSettings();
    return jsonSuccess({ message: "Settings saved" });
  } catch (error) {
    return handleApiError(error);
  }
}
