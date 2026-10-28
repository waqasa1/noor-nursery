import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import {
  getAllSettings,
  setSetting,
  getDeliveryConfig,
  getStoreInfo,
  getBankConfig,
  getEasypaisaConfig,
  getPromoCodes,
  getBannerConfig,
  getSiteContent,
} from "@/lib/settings";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const updateSchema = z.object({
  delivery: z.object({
    defaultFee: z.number().min(0),
    freeThreshold: z.number().min(0),
    cityFees: z.record(z.number()).optional(),
  }).optional(),
  store: z.object({
    name: z.string().min(1),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
  }).optional(),
  bank: z.object({
    accountTitle: z.string().optional(),
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    branch: z.string().optional(),
  }).optional(),
  easypaisa: z.object({
    accountTitle: z.string().max(80).optional(),
    accountNumber: z.string().max(30).optional(),
  }).optional(),
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
    const [delivery, store, bank, easypaisa, promo_codes, banner, site_content, raw] = await Promise.all([
      getDeliveryConfig(),
      getStoreInfo(),
      getBankConfig(),
      getEasypaisaConfig(),
      getPromoCodes(),
      getBannerConfig(),
      getSiteContent(),
      getAllSettings(),
    ]);
    return jsonSuccess({ delivery, store, bank, easypaisa, promo_codes, banner, site_content, raw });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400);
    }

    const updates = [];
    if (parsed.data.delivery) updates.push(setSetting("delivery", parsed.data.delivery));
    if (parsed.data.store) updates.push(setSetting("store", parsed.data.store));
    if (parsed.data.bank) updates.push(setSetting("bank", parsed.data.bank));
    if (parsed.data.easypaisa) updates.push(setSetting("easypaisa", parsed.data.easypaisa));
    if (parsed.data.promo_codes) updates.push(setSetting("promo_codes", parsed.data.promo_codes));
    if (parsed.data.banner) updates.push(setSetting("banner", parsed.data.banner));
    if (parsed.data.site_content) updates.push(setSetting("site_content", parsed.data.site_content));

    await Promise.all(updates);
    return jsonSuccess({ message: "Settings saved" });
  } catch (error) {
    return handleApiError(error);
  }
}
