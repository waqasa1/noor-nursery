import { revalidatePath } from "next/cache";

/** After admin saves banner / FAQs / testimonials / store content. */
export function revalidateSiteSettings() {
  revalidatePath("/", "layout");
  revalidatePath("/shop");
  revalidatePath("/categories");
  revalidatePath("/faq");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/api/site-settings");
}
