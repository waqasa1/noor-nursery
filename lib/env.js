import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  MONGODB_URI: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(32).optional(),
  AUTH_URL: z.string().url().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  NEXT_PUBLIC_CURRENCY: z.string().default("PKR"),
  NEXT_PUBLIC_STORE_NAME: z.string().default("Noor Nursery"),
  NEXT_PUBLIC_STORE_PHONE: z.string().optional(),
  NEXT_PUBLIC_STORE_EMAIL: z.string().optional(),
  NEXT_PUBLIC_STORE_ADDRESS: z.string().optional(),
  DEFAULT_DELIVERY_FEE: z.coerce.number().default(250),
  FREE_DELIVERY_THRESHOLD: z.coerce.number().default(2500),
  BANK_ACCOUNT_TITLE: z.string().optional(),
  BANK_ACCOUNT_NUMBER: z.string().optional(),
  BANK_NAME: z.string().optional(),
  BANK_BRANCH: z.string().optional(),
  PAYFAST_MERCHANT_ID: z.string().optional(),
  PAYFAST_MERCHANT_KEY: z.string().optional(),
  PAYFAST_SECRET: z.string().optional(),
  PAYFAST_RETURN_URL: z.string().optional(),
  PAYFAST_CANCEL_URL: z.string().optional(),
  PAYFAST_NOTIFY_URL: z.string().optional(),
  JAZZCASH_MERCHANT_ID: z.string().optional(),
  JAZZCASH_PASSWORD: z.string().optional(),
  JAZZCASH_INTEGRITY_SALT: z.string().optional(),
  JAZZCASH_RETURN_URL: z.string().optional(),
  EASYPAISA_STORE_ID: z.string().optional(),
  EASYPAISA_HASH_KEY: z.string().optional(),
  EASYPAISA_RETURN_URL: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

/** @type {z.infer<typeof envSchema> | null} */
let cached = null;

export function getEnv() {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.warn("Environment validation warnings:", parsed.error.flatten().fieldErrors);
    cached = envSchema.parse({ ...process.env, NODE_ENV: process.env.NODE_ENV || "development" });
  } else {
    cached = parsed.data;
  }
  return cached;
}

export function isPaymentConfigured(method) {
  const env = getEnv();
  switch (method) {
    case "payfast":
      return !!(env.PAYFAST_MERCHANT_ID && env.PAYFAST_MERCHANT_KEY && env.PAYFAST_SECRET);
    case "jazzcash":
      return !!(env.JAZZCASH_MERCHANT_ID && env.JAZZCASH_PASSWORD && env.JAZZCASH_INTEGRITY_SALT);
    case "easypaisa":
      return !!(env.EASYPAISA_STORE_ID && env.EASYPAISA_HASH_KEY);
    case "bank_transfer":
      return !!(env.BANK_ACCOUNT_NUMBER && env.BANK_ACCOUNT_TITLE);
    case "cod":
      return true;
    default:
      return false;
  }
}
