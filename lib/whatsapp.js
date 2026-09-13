const DEFAULT_PHONE = "923492849062";

/** Normalize to wa.me digits (92XXXXXXXXXX). */
export function normalizeWhatsAppPhone(raw) {
  const digits = String(raw || DEFAULT_PHONE).replace(/\D/g, "");
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits || DEFAULT_PHONE;
}

export function getWhatsAppPhone() {
  return normalizeWhatsAppPhone(process.env.NEXT_PUBLIC_STORE_PHONE);
}

/** Display format e.g. +92 349 2849062 */
export function formatStorePhone(raw) {
  const phone = normalizeWhatsAppPhone(raw || process.env.NEXT_PUBLIC_STORE_PHONE);
  if (phone.length >= 12) {
    return `+${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5)}`;
  }
  return `+${phone}`;
}

export function getAppBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function buildWhatsAppUrl(message = "") {
  const phone = getWhatsAppPhone();
  const base = `https://wa.me/${phone}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message.trim())}`;
}

export function plantDoctorMessage() {
  return (
    "Hi Noor Nursery! I need help with plant care / choosing the right plant for my home. Can you advise?"
  );
}

export function bulkOrderMessage() {
  return (
    "Hi Noor Nursery! I'm interested in a bulk / commercial nursery order (farmhouse, office, or landscaping). Please share options and pricing."
  );
}

export function generalSupportMessage() {
  return "Hi Noor Nursery! I have a question about your plants and delivery. Can you help?";
}

export function productInquiryMessage({
  nameEn,
  nameUr,
  slug,
  sizeLabel,
  price,
  baseUrl,
}) {
  const origin = baseUrl || getAppBaseUrl();
  const productUrl = `${origin.replace(/\/$/, "")}/products/${slug}`;
  const lines = [
    "Hi Noor Nursery! I'm interested in:",
    "",
    `*${nameEn}*${nameUr ? ` (${nameUr})` : ""}`,
  ];
  if (sizeLabel) lines.push(`Size: ${sizeLabel}`);
  if (price != null) lines.push(`Price: PKR ${price}`);
  lines.push("", productUrl, "", "Please share availability and delivery info. Thanks!");
  return lines.join("\n");
}

export function orderInquiryMessage({ orderNumber, total, paymentMethod, baseUrl }) {
  const origin = baseUrl || getAppBaseUrl();
  const trackUrl = `${origin.replace(/\/$/, "")}/track-order?order=${encodeURIComponent(orderNumber)}`;
  const lines = [
    "Hi Noor Nursery! I have a question about my order:",
    "",
    `Order: *${orderNumber}*`,
  ];
  if (total != null) lines.push(`Total: PKR ${total}`);
  if (paymentMethod) lines.push(`Payment: ${paymentMethod.replace(/_/g, " ")}`);
  lines.push("", trackUrl, "", "Please assist. Thanks!");
  return lines.join("\n");
}

export function buildProductWhatsAppUrl(props) {
  return buildWhatsAppUrl(productInquiryMessage(props));
}

export function buildOrderWhatsAppUrl(props) {
  return buildWhatsAppUrl(orderInquiryMessage(props));
}

export function buildPlantDoctorWhatsAppUrl() {
  return buildWhatsAppUrl(plantDoctorMessage());
}

export function buildBulkOrderWhatsAppUrl() {
  return buildWhatsAppUrl(bulkOrderMessage());
}
