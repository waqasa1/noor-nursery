import { z } from "zod";

export const checkoutAddressSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Enter a valid email address"),
  addressLine1: z.string().min(5, "Address must be at least 5 characters"),
  addressLine2: z.string().optional(),
  area: z.string().min(2, "Area must be at least 2 characters"),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  postalCode: z.string().optional(),
  country: z.string().default("Pakistan"),
  deliveryInstructions: z.string().optional(),
});

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1, "Your cart is empty"),
  customer: z.object({
    name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
  }),
  shippingAddress: checkoutAddressSchema,
  paymentMethod: z.enum(["cod", "bank_transfer", "jazzcash", "easypaisa", "payfast"], {
    errorMap: () => ({ message: "Select a payment method" }),
  }),
  promoCode: z.string().optional(),
  customerNote: z.string().max(500, "Order note must be 500 characters or less").optional(),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, { message: "You must agree to the terms and return policy" }),
});

/** Build the checkout API payload from form state. */
export function buildCheckoutPayload(form, items, appliedPromo) {
  return {
    items: items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
    })),
    customer: { name: form.name, email: form.email, phone: form.phone },
    shippingAddress: {
      fullName: form.fullName || form.name,
      phone: form.phone,
      email: form.email,
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2 || undefined,
      area: form.area,
      city: form.city,
      province: form.province,
      postalCode: form.postalCode || undefined,
      deliveryInstructions: form.deliveryInstructions || undefined,
    },
    paymentMethod: form.paymentMethod || "cod",
    promoCode: appliedPromo || undefined,
    customerNote: form.customerNote || undefined,
    agreeToTerms: form.agreeToTerms,
  };
}

const API_FIELD_TO_FORM = {
  "customer.name": "name",
  "customer.email": "email",
  "customer.phone": "phone",
  "shippingAddress.fullName": "name",
  "shippingAddress.phone": "phone",
  "shippingAddress.email": "email",
  "shippingAddress.addressLine1": "addressLine1",
  "shippingAddress.addressLine2": "addressLine2",
  "shippingAddress.area": "area",
  "shippingAddress.city": "city",
  "shippingAddress.province": "province",
  "shippingAddress.postalCode": "postalCode",
  "shippingAddress.deliveryInstructions": "deliveryInstructions",
  paymentMethod: "paymentMethod",
  customerNote: "customerNote",
  agreeToTerms: "agreeToTerms",
  items: "_cart",
};

function mapIssuesToFields(issues) {
  const mapped = {};
  for (const issue of issues || []) {
    const path = Array.isArray(issue.path)
      ? issue.path.join(".")
      : typeof issue.path === "string"
        ? issue.path
        : "";
    const formKey = API_FIELD_TO_FORM[path] || path;
    if (path && issue.message && !mapped[formKey]) {
      mapped[formKey] = issue.message;
    }
  }
  return mapped;
}

/** Map Zod issue paths to checkout form field keys (works with Zod 4). */
export function mapCheckoutFieldErrors(errors) {
  if (!errors || typeof errors !== "object") return {};

  if (errors.name === "ZodError" || Array.isArray(errors.issues)) {
    return mapIssuesToFields(errors.issues);
  }

  if (Array.isArray(errors)) {
    return mapIssuesToFields(errors);
  }

  // Already mapped { fieldName: "message" } from API
  const entries = Object.entries(errors);
  if (entries.length > 0 && entries.every(([, msg]) => typeof msg === "string")) {
    return { ...errors };
  }

  return mapIssuesToFields(flattenFieldErrorsToIssues(errors));
}

function flattenFieldErrorsToIssues(fieldErrors, prefix = "") {
  if (!fieldErrors || typeof fieldErrors !== "object") return [];
  const issues = [];
  for (const [key, value] of Object.entries(fieldErrors)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      for (const message of value) {
        if (message) issues.push({ path: path.split("."), message });
      }
      continue;
    }
    if (value && typeof value === "object") {
      issues.push(...flattenFieldErrorsToIssues(value, path));
    }
  }
  return issues;
}

export function validateCheckoutForm(form, items, appliedPromo) {
  const payload = buildCheckoutPayload(form, items, appliedPromo);
  const parsed = checkoutSchema.safeParse(payload);
  if (parsed.success) {
    return { valid: true, payload: parsed.data };
  }
  return {
    valid: false,
    fieldErrors: mapCheckoutFieldErrors(parsed.error),
  };
}
