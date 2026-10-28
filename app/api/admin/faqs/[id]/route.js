import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { getSetting, setSetting } from "@/lib/settings";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const faqSchema = z.object({
  q: z.string().min(3).max(300),
  a: z.string().min(3).max(2000),
});

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = faqSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.flatten());
    }

    const faqs = (await getSetting("faqs", [])) ?? [];
    const list = Array.isArray(faqs) ? faqs : [];
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return jsonError("FAQ not found", 404);

    list[idx] = {
      ...list[idx],
      q: parsed.data.q.trim(),
      a: parsed.data.a.trim(),
    };
    await setSetting("faqs", list);
    return jsonSuccess({ faq: list[idx] });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const faqs = (await getSetting("faqs", [])) ?? [];
    const list = Array.isArray(faqs) ? faqs : [];
    const filtered = list.filter((t) => t.id !== id);
    if (filtered.length === list.length) {
      return jsonError("FAQ not found", 404);
    }
    await setSetting("faqs", filtered);
    return jsonSuccess({ deleted: id });
  } catch (error) {
    return handleApiError(error);
  }
}
