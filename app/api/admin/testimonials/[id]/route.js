import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { getSetting, setSetting } from "@/lib/settings";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const testimonialSchema = z.object({
  name: z.string().min(1).max(100),
  initials: z.string().min(1).max(4),
  location: z.string().max(150).optional().default(""),
  when: z.string().max(60).optional().default(""),
  quote: z.string().min(1).max(800),
  rtl: z.boolean().optional().default(false),
});

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = params;
    const body = await request.json();
    const parsed = testimonialSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.flatten());
    }

    const testimonials = (await getSetting("testimonials", [])) ?? [];
    const idx = testimonials.findIndex((t) => t.id === id);
    if (idx === -1) return jsonError("Testimonial not found", 404);

    testimonials[idx] = { ...testimonials[idx], ...parsed.data };
    await setSetting("testimonials", testimonials);
    return jsonSuccess({ testimonial: testimonials[idx] });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = params;

    const testimonials = (await getSetting("testimonials", [])) ?? [];
    const filtered = testimonials.filter((t) => t.id !== id);
    if (filtered.length === testimonials.length) {
      return jsonError("Testimonial not found", 404);
    }
    await setSetting("testimonials", filtered);
    return jsonSuccess({ deleted: id });
  } catch (error) {
    return handleApiError(error);
  }
}

