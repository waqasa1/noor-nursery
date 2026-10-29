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

export async function GET() {
  try {
    await requireAdmin();
    const testimonials = (await getSetting("testimonials", [])) ?? [];
    return jsonSuccess({ testimonials });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = testimonialSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.flatten());
    }

    const testimonials = (await getSetting("testimonials", [])) ?? [];
    const newItem = {
      id: Date.now().toString(),
      ...parsed.data,
    };
    await setSetting("testimonials", [...testimonials, newItem]);
    const { revalidateSiteSettings } = await import("@/lib/cache/site-settings");
    revalidateSiteSettings();
    return jsonSuccess({ testimonial: newItem }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

