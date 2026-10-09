import crypto from "crypto";

/**
 * Field order from JazzCash sandbox "HTTP POST (Page Redirection) Testing"
 * CalculateHash() — NOT alphabetical in docs UI, but this explicit list matches v1.1/v2.0 samples.
 */
const PAYMENT_PORTAL_HASH_FIELDS_V11 = [
  "pp_Amount",
  "pp_BillReference",
  "pp_Description",
  "pp_Language",
  "pp_MerchantID",
  "pp_Password",
  "pp_ReturnURL",
  "pp_SubMerchantID",
  "pp_TxnCurrency",
  "pp_TxnDateTime",
  "pp_TxnExpiryDateTime",
  "pp_TxnRefNo",
  "pp_TxnType",
  "pp_Version",
  "ppmpf_1",
  "ppmpf_2",
  "ppmpf_3",
  "ppmpf_4",
  "ppmpf_5",
];

/** Extra fields inserted for pp_Version 2.0 (tokenization / registered customer). */
const PAYMENT_PORTAL_HASH_FIELDS_V20_EXTRA = [
  { after: "pp_BillReference", fields: ["pp_CustomerEmail", "pp_CustomerID", "pp_CustomerMobile"] },
  { after: "pp_Description", fields: ["pp_IsRegisteredCustomer"] },
  { after: "pp_SubMerchantID", fields: ["pp_TokenizedCardNumber"] },
];

function hashFieldOrder(version) {
  if (version !== "2.0") return PAYMENT_PORTAL_HASH_FIELDS_V11;

  const order = [...PAYMENT_PORTAL_HASH_FIELDS_V11];
  for (const block of PAYMENT_PORTAL_HASH_FIELDS_V20_EXTRA) {
    const idx = order.indexOf(block.after);
    if (idx === -1) continue;
    order.splice(idx + 1, 0, ...block.fields);
  }
  return order;
}

function nonEmpty(value) {
  return value !== undefined && value !== null && String(value).length > 0;
}

/**
 * Build pp_SecureHash for Payment Portal (merchantform) requests/responses.
 * Matches sandbox CryptoJS.HmacSHA256(message, integritySalt) — lowercase hex.
 */
export function buildPaymentPortalSecureHash(params, integritySalt, version = "1.1") {
  const fields = hashFieldOrder(version);
  const values = [integritySalt];

  for (const key of fields) {
    if (key === "pp_SecureHash") continue;
    const value = params[key];
    if (nonEmpty(value)) values.push(String(value));
  }

  const message = values.join("&");
  return crypto.createHmac("sha256", integritySalt).update(message, "utf8").digest("hex");
}

export function verifyPaymentPortalSecureHash(params, integritySalt, version = "1.1") {
  const provided = params?.pp_SecureHash;
  if (!nonEmpty(provided)) return false;
  const expected = buildPaymentPortalSecureHash(params, integritySalt, version);
  return expected.toLowerCase() === String(provided).toLowerCase();
}
