const CURRENCY = "PKR";

/** Convert PKR amount to minor units (paisa) for safe math */
export function toMinorUnits(amount) {
  return Math.round(Number(amount) * 100);
}

/** Convert minor units back to PKR */
export function fromMinorUnits(minor) {
  return minor / 100;
}

/** Format PKR for display */
export function formatPKR(amount, { showDecimals = false } = {}) {
  const num = Number(amount);
  if (Number.isNaN(num)) return `${CURRENCY} 0`;
  const formatted = new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(num);
  return `${CURRENCY} ${formatted}`;
}

/** Sum line items safely using minor units */
export function sumLineTotals(items) {
  const totalMinor = items.reduce(
    (sum, item) => sum + toMinorUnits(item.unitPrice) * item.quantity,
    0
  );
  return fromMinorUnits(totalMinor);
}

export function calculateOrderTotals({ items, deliveryFee = 0, discount = 0 }) {
  const subtotalMinor = items.reduce(
    (sum, item) => sum + toMinorUnits(item.unitPrice) * item.quantity,
    0
  );
  const deliveryMinor = toMinorUnits(deliveryFee);
  const discountMinor = toMinorUnits(discount);
  const totalMinor = Math.max(0, subtotalMinor + deliveryMinor - discountMinor);

  return {
    subtotal: fromMinorUnits(subtotalMinor),
    deliveryFee: fromMinorUnits(deliveryMinor),
    discount: fromMinorUnits(discountMinor),
    total: fromMinorUnits(totalMinor),
  };
}
