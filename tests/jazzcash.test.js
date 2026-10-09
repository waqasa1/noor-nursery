import { describe, expect, it } from "vitest";
import { buildPaymentPortalSecureHash } from "@/lib/payments/jazzcash-hash";
import {
  jazzCashBillReference,
  resolveOrderNumberFromJazzCashPayload,
} from "@/lib/payments/jazzcash.provider";

describe("jazzCashBillReference", () => {
  it("strips hyphens for gateway bill reference", () => {
    expect(jazzCashBillReference("NN-261009-YUQWWX")).toBe("NN261009YUQWWX");
  });
});

describe("buildPaymentPortalSecureHash", () => {
  it("matches JazzCash sandbox v1.1 HTTP POST sample", () => {
    const salt = "3479f1w82t";
    const params = {
      pp_Version: "1.1",
      pp_MerchantID: "MC896183",
      pp_Language: "EN",
      pp_Password: "5y32u08x57",
      pp_TxnRefNo: "T20261009105536",
      pp_Amount: "10000",
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: "20261009105536",
      pp_TxnExpiryDateTime: "20261010105536",
      pp_BillReference: "billRef",
      pp_Description: "Description of transaction",
      pp_ReturnURL: "https://noor-nursery.vercel.app/api/jazzcash/return",
      ppmpf_1: "1",
      ppmpf_2: "2",
      ppmpf_3: "3",
      ppmpf_4: "4",
      ppmpf_5: "5",
    };

    expect(buildPaymentPortalSecureHash(params, salt, "1.1")).toBe(
      "b1173b145cfe03457bca0a0180dcb20f3d434727ff10d90637ed3c48e6261488"
    );
  });
});

describe("resolveOrderNumberFromJazzCashPayload", () => {
  it("prefers ppmpf_1 with full order number", () => {
    expect(
      resolveOrderNumberFromJazzCashPayload({
        pp_BillReference: "NN261009YUQWWX",
        ppmpf_1: "NN-261009-YUQWWX",
      })
    ).toBe("NN-261009-YUQWWX");
  });

  it("restores order number from sanitized bill reference", () => {
    expect(
      resolveOrderNumberFromJazzCashPayload({
        pp_BillReference: "NN261009YUQWWX",
      })
    ).toBe("NN-261009-YUQWWX");
  });
});
