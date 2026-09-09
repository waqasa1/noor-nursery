import { describe, it, expect } from "vitest";
import { slugify, generateOrderNumber } from "@/lib/utils/slug";

describe("slug", () => {
  it("slugifies text", () => {
    expect(slugify("Snake Plant Laurentii")).toBe("snake-plant-laurentii");
  });

  it("generates unique order numbers", () => {
    const a = generateOrderNumber();
    const b = generateOrderNumber();
    expect(a).toMatch(/^NN-/);
    expect(a).not.toBe(b);
  });
});
