import { describe, it, expect } from "vitest";
import { toMinorUnits, fromMinorUnits, formatPKR, calculateOrderTotals } from "@/lib/utils/currency";

describe("currency", () => {
  it("converts to and from minor units safely", () => {
    expect(toMinorUnits(850)).toBe(85000);
    expect(fromMinorUnits(85000)).toBe(850);
  });

  it("formats PKR correctly", () => {
    expect(formatPKR(1250)).toContain("PKR");
    expect(formatPKR(1250)).toContain("1,250");
  });

  it("calculates order totals without float errors", () => {
    const result = calculateOrderTotals({
      items: [{ unitPrice: 850, quantity: 2 }],
      deliveryFee: 250,
      discount: 0,
    });
    expect(result.subtotal).toBe(1700);
    expect(result.total).toBe(1950);
  });
});
