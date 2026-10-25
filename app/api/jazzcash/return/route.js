import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

/**
 * JazzCash merchant return URL — DISABLED.
 * Automatic merchant portal callbacks are not used; customers pay via manual
 * JazzCash Send Money and submit their TID/TrxID on the order page.
 *
 * Merchant callback code kept commented for reference:
 *
 * // import { processPaymentCallback } from "@/lib/orders/create";
 * // import { connectDB, isDBConfigured } from "@/lib/db";
 * // import Order from "@/models/Order";
 * // import { orderSuccessPath } from "@/lib/orders/access";
 * // const result = await processPaymentCallback("jazzcash", payload, idempotencyKey);
 */

async function handleReturn() {
  const baseUrl = getEnv().NEXT_PUBLIC_APP_URL;
  return NextResponse.redirect(`${baseUrl}/track-order?payment=manual`, 303);
}

export async function GET() {
  return handleReturn();
}

export async function POST() {
  return handleReturn();
}
