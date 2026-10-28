"use client";

import { OTHER_CITY_VALUE, titleCaseCity } from "@/lib/delivery-defaults";

/**
 * City dropdown from admin delivery fee cities + "Other city".
 * When Other is selected, a text field asks for the city name.
 */
export function CheckoutCitySelect({
  cities = [],
  cityKey,
  otherCity,
  onCityKeyChange,
  onOtherCityChange,
  error,
  inputClassName,
}) {
  const isOther = cityKey === OTHER_CITY_VALUE;

  return (
    <div className="sm:col-span-1">
      <label htmlFor="city" className="block text-sm font-medium text-foreground">
        City
      </label>

      <select
        id="city"
        value={cityKey}
        onChange={(e) => onCityKeyChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? "city-error" : undefined}
        className={inputClassName}
      >
        {cities.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
        <option value={OTHER_CITY_VALUE}>Other city</option>
      </select>

      {isOther && (
        <div className="mt-3">
          <label htmlFor="cityOther" className="block text-sm font-medium text-foreground">
            Your city name
          </label>
          <input
            id="cityOther"
            value={otherCity}
            onChange={(e) => onOtherCityChange(e.target.value)}
            placeholder="e.g. Sialkot"
            aria-invalid={!!error}
            className={inputClassName}
          />
        </div>
      )}

      {error && (
        <p id="city-error" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** Resolve shipping city string from select state. */
export function resolveCheckoutCity(cityKey, otherCity, cities = []) {
  if (cityKey === OTHER_CITY_VALUE) {
    return String(otherCity || "").trim();
  }
  const match = cities.find((c) => c.value === cityKey);
  return match?.label || titleCaseCity(cityKey);
}
