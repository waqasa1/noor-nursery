import { processPaymentCallback } from "@/lib/orders/create";
import { getEnv } from "@/lib/env";
import { NextResponse } from "next/server";

export async function POST(request) {
  const formData = await request.formData();
  const payload = Object.fromEntries(formData.entries());
  const idempotencyKey = `easypaisa-${payload.transactionId || payload.orderRefNum}-${payload.orderRefNum}`;

  const result = await processPaymentCallback("easypaisa", payload, idempotencyKey);
  const baseUrl = getEnv().NEXT_PUBLIC_APP_URL;

  if (result.success) {
    return NextResponse.redirect(`${baseUrl}/order-success/${result.orderNumber}?payment=success`);
  }
  return NextResponse.redirect(`${baseUrl}/track-order?payment=failed`);
}
