import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { getSetting, setSetting } from "@/lib/settings";
import { getDefaultFaqsForImport } from "@/lib/faqs.server";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const faqSchema = z.object({
  q: z.string().min(3).max(300),
  a: z.string().min(3).max(2000),
});

const replaceSchema = z.object({
  faqs: z.array(faqSchema),
});

export async function GET() {
  try {
    await requireAdmin();
    const stored = await getSetting("faqs", null);
    const faqs = Array.isArray(stored) ? stored : [];
    return jsonSuccess({
      faqs,
      configured: stored != null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const body = await request.json();

    // Import / replace entire list
    if (body?.importDefaults === true) {
      const defaults = await getDefaultFaqsForImport();
      await setSetting("faqs", defaults);
      return jsonSuccess({ faqs: defaults, imported: true });
    }

    if (Array.isArray(body?.faqs)) {
      const parsed = replaceSchema.safeParse(body);
      if (!parsed.success) {
        return jsonError("Validation failed", 400, parsed.error.flatten());
      }
      const faqs = parsed.data.faqs.map((f, i) => ({
        id: `faq-${Date.now()}-${i}`,
        q: f.q.trim(),
        a: f.a.trim(),
      }));
      await setSetting("faqs", faqs);
      return jsonSuccess({ faqs });
    }

    const parsed = faqSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.flatten());
    }

    const existing = (await getSetting("faqs", null)) ?? [];
    const list = Array.isArray(existing) ? existing : [];
    const newItem = {
      id: Date.now().toString(),
      q: parsed.data.q.trim(),
      a: parsed.data.a.trim(),
    };
    const faqs = [...list, newItem];
    await setSetting("faqs", faqs);
    return jsonSuccess({ faq: newItem, faqs }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
