export const BRAND = {
  name: "Noor Nursery",
  sloganPrimary: "Noor Nursery, the name of customer trust.",
  sloganSecondary: "Quality you can trust, service you deserve!",
  tagline: "The name of customer trust",
  /** Public-facing support inbox shown on Contact, Privacy, etc. */
  email: "support@noornursery.pk",
  city: "Lahore, Punjab, Pakistan",
  since: 2012,
};

/** Prefer env when set; otherwise the brand support address. */
export function storePublicEmail() {
  const fromEnv =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_STORE_EMAIL : "";
  if (fromEnv && !fromEnv.toLowerCase().startsWith("orders@")) {
    return fromEnv;
  }
  return BRAND.email;
}
