import { NextResponse } from "next/server";
import { processPaymentCallback } from "@/lib/orders/create";
import { getEnv } from "@/lib/env";

function payloadFromRequest(request, formData) {
  if (formData) {
    return Object.fromEntries(formData.entries());
  }
  const { searchParams } = new URL(request.url);
  return Object.fromEntries(searchParams.entries());
}

async function handleReturn(request, formData = null) {
  const payload = payloadFromRequest(request, formData);
  const baseUrl = getEnv().NEXT_PUBLIC_APP_URL;
  const txnRef = payload.pp_TxnRefNo || "unknown";
  const billRef = payload.pp_BillReference || payload.ppmpf_1 || "unknown";
  const idempotencyKey = `jazzcash-${txnRef}-${billRef}`;

  const result = await processPaymentCallback("jazzcash", payload, idempotencyKey);

  if (result.orderNumber) {
    const status = result.success ? "success" : "failed";
    return NextResponse.redirect(
      `${baseUrl}/order-success/${result.orderNumber}?payment=${status}`,
      303
    );
  }

  return NextResponse.redirect(`${baseUrl}/track-order?payment=failed`, 303);
}

/** JazzCash POSTs transaction result here after checkout. */
export async function POST(request) {
  const formData = await request.formData();
  return handleReturn(request, formData);
}

/** Some JazzCash flows may bounce back with query params. */
export async function GET(request) {
  return handleReturn(request);
}
