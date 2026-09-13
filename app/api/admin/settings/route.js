import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import {
  getAllSettings,
  setSetting,
  getDeliveryConfig,
  getStoreInfo,
  getBankConfig,
  getPromoCodes,
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
  promo_codes: z.record(z.object({
    code: z.string(),
    type: z.enum(["percent", "fixed"]),
    value: z.number().min(0),
    minSubtotal: z.number().min(0).optional(),
    active: z.boolean(),
    label: z.string().optional(),
  })).optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    const [delivery, store, bank, promo_codes, raw] = await Promise.all([
      getDeliveryConfig(),
      getStoreInfo(),
      getBankConfig(),
      getPromoCodes(),
      getAllSettings(),
    ]);
    return jsonSuccess({ delivery, store, bank, promo_codes, raw });
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
    if (parsed.data.promo_codes) updates.push(setSetting("promo_codes", parsed.data.promo_codes));

    await Promise.all(updates);
    return jsonSuccess({ message: "Settings saved" });
  } catch (error) {
    return handleApiError(error);
  }
}
