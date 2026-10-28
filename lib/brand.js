export const BRAND = {
  name: "Noor Nursery",
  sloganPrimary: "Noor Nursery, the name of customer trust.",
  sloganSecondary: "Quality you can trust, service you deserve!",
  tagline: "The name of customer trust",
  city: "Karachi, Sindh, Pakistan",
  since: 1965,
  mainOffice: {
    label: "Main office",
    address:
      "Opposite New Rizwia, Gulzar-e-Hijri Sector 29, Gulzar E Hijri Scheme 33, Karachi, 75330, Pakistan",
    /** Open in Google Maps (Noor Nursery Karachi place) */
    mapsUrl: "https://www.google.com/maps?ftid=0x3eb339004993ab67:0xba8708dcdc11a4e7",
    /** Official Google Maps embed */
    mapsEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3617.446107593612!2d67.1434728!3d24.9509324!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb339004993ab67%3A0xba8708dcdc11a4e7!2sNoor%20nursery!5e0!3m2!1sen!2s!4v1793196978400!5m2!1sen!2s",
  },
};

/** Public store email from env (`NEXT_PUBLIC_STORE_EMAIL`). */
export function storePublicEmail() {
  return process.env.NEXT_PUBLIC_STORE_EMAIL || "";
}
