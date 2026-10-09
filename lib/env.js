import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  MONGODB_URI: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(32).optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  NEXT_PUBLIC_CURRENCY: z.string().default("PKR"),
  NEXT_PUBLIC_STORE_NAME: z.string().default("Noor Nursery"),
  NEXT_PUBLIC_STORE_PHONE: z.string().optional(),
  NEXT_PUBLIC_STORE_EMAIL: z.string().optional(),
  NEXT_PUBLIC_STORE_ADDRESS: z.string().optional(),
  DEFAULT_DELIVERY_FEE: z.coerce.number().default(250),
  FREE_DELIVERY_THRESHOLD: z.coerce.number().default(2500),
  // Bank details are kept for admin records only — bank transfer is no
  // longer offered as a payment method at checkout.
  BANK_ACCOUNT_TITLE: z.string().optional(),
  BANK_ACCOUNT_NUMBER: z.string().optional(),
  BANK_NAME: z.string().optional(),
  BANK_BRANCH: z.string().optional(),
  // JazzCash HTTP POST page redirect (sandbox until JAZZCASH_ENV=production)
  JAZZCASH_MERCHANT_ID: z.string().optional(),
  JAZZCASH_PASSWORD: z.string().optional(),
  JAZZCASH_INTEGRITY_SALT: z.string().optional(),
  JAZZCASH_RETURN_URL: z.string().url().optional(),
  JAZZCASH_ENV: z.enum(["sandbox", "production"]).optional(),
  JAZZCASH_TXN_TYPE: z.string().optional(),
  JAZZCASH_PORTAL_VERSION: z.enum(["1.1", "2.0"]).optional(),
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

