/** Default per-city delivery fees (PKR). Keys are lowercase city names. */
export const DEFAULT_CITY_FEES = {
  lahore: 150,
  karachi: 300,
  islamabad: 250,
  rawalpindi: 250,
  faisalabad: 200,
  multan: 200,
};

/** Checkout select value for cities not in the fee table (uses default fee). */
export const OTHER_CITY_VALUE = "__other__";

export function titleCaseCity(key) {
  return String(key || "")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Sorted options for checkout / admin display. */
export function cityOptionsFromFees(cityFees = {}) {
  return Object.keys(cityFees)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => ({
      value: key,
      label: titleCaseCity(key),
      fee: Number(cityFees[key]) || 0,
    }));
}
