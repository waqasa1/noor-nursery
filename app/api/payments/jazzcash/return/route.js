import { processPaymentCallback } from "@/lib/orders/create";
import { getEnv } from "@/lib/env";
import { NextResponse } from "next/server";

export async function POST(request) {
  const formData = await request.formData();
  const payload = Object.fromEntries(formData.entries());
  const idempotencyKey = `jazzcash-${payload.pp_TxnRefNo}-${payload.pp_BillReference}`;

  const result = await processPaymentCallback("jazzcash", payload, idempotencyKey);
  const baseUrl = getEnv().NEXT_PUBLIC_APP_URL;

  if (result.success) {
    return NextResponse.redirect(`${baseUrl}/order-success/${result.orderNumber}?payment=success`);
  }
  return NextResponse.redirect(`${baseUrl}/order-success/${result.orderNumber || ""}?payment=failed`);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const payload = Object.fromEntries(searchParams.entries());
  const idempotencyKey = `jazzcash-${payload.pp_TxnRefNo}-${payload.pp_BillReference}`;

  const result = await processPaymentCallback("jazzcash", payload, idempotencyKey);
  const baseUrl = getEnv().NEXT_PUBLIC_APP_URL;

  if (result.success) {
    return NextResponse.redirect(`${baseUrl}/order-success/${result.orderNumber}?payment=success`);
  }
  return NextResponse.redirect(`${baseUrl}/track-order?payment=failed`);
}
