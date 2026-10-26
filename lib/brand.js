export const BRAND = {
  name: "Noor Nursery",
  sloganPrimary: "Noor Nursery, the name of customer trust.",
  sloganSecondary: "Quality you can trust, service you deserve!",
  tagline: "The name of customer trust",
  city: "Karachi, Sindh, Pakistan",
  since: 2012,
};

/** Public store email from env (`NEXT_PUBLIC_STORE_EMAIL`). */
export function storePublicEmail() {
  return process.env.NEXT_PUBLIC_STORE_EMAIL || "";
}
