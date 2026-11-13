import { describe, it, expect } from "vitest";
import { expandItemsForStock, maxBundlesFromStock } from "@/lib/bundles/stock";
import { calculateOrderTotals } from "@/lib/utils/currency";
import { cartLineKey, isBundleLine } from "@/lib/cart/line-key";

describe("bundle stock helpers", () => {
  it("computes max complete bundles from component stock", () => {
    expect(
      maxBundlesFromStock([
        { quantity: 2, stock: 5 },
        { quantity: 1, stock: 3 },
      ])
    ).toBe(2);

    expect(
      maxBundlesFromStock([
        { quantity: 1, stock: 0 },
        { quantity: 1, stock: 10 },
      ])
    ).toBe(0);
  });

  it("expands bundle lines into component stock movements", () => {
    const stockItems = expandItemsForStock([
      {
        lineType: "bundle",
        quantity: 2,
        nameEn: "Starter set",
        bundleContents: [
          { productId: "p1", variantId: "v1", quantity: 1, nameEn: "Plant A" },
          { productId: "p2", variantId: "v2", quantity: 2, nameEn: "Pot" },
        ],
      },
      {
        lineType: "product",
        productId: "p1",
        variantId: "v1",
        quantity: 1,
        nameEn: "Plant A",
      },
    ]);

    expect(stockItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ productId: "p1", variantId: "v1", quantity: 3 }),
        expect.objectContaining({ productId: "p2", variantId: "v2", quantity: 4 }),
      ])
    );
  });

  it("charges the admin set price for a bundle line", () => {
    const totals = calculateOrderTotals({
      items: [{ unitPrice: 3000, quantity: 1 }],
      deliveryFee: 250,
      discount: 0,
    });
    expect(totals.subtotal).toBe(3000);
    expect(totals.total).toBe(3250);
  });
});

describe("cart line keys", () => {
  it("keys bundles separately from products", () => {
    expect(cartLineKey({ type: "bundle", bundleId: "b1" })).toBe("bundle:b1");
    expect(cartLineKey({ productId: "p1", variantId: "v1" })).toBe("product:p1:v1");
    expect(isBundleLine({ type: "bundle", bundleId: "b1" })).toBe(true);
    expect(isBundleLine({ productId: "p1", variantId: "v1" })).toBe(false);
  });
});
