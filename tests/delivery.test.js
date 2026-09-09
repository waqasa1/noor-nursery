import { describe, it, expect } from "vitest";
import { calculateDeliveryFee } from "@/lib/delivery";

describe("delivery", () => {
  it("applies free delivery above threshold", () => {
    expect(calculateDeliveryFee("Lahore", 3000)).toBe(0);
  });

  it("charges city-specific fee below threshold", () => {
    expect(calculateDeliveryFee("Lahore", 500)).toBe(150);
    expect(calculateDeliveryFee("Karachi", 500)).toBe(300);
  });
});
