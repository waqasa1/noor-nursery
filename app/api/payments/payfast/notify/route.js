import { processPaymentCallback } from "@/lib/orders/create";
import { NextResponse } from "next/server";

export async function POST(request) {
  const formData = await request.formData();
  const payload = Object.fromEntries(formData.entries());
  const idempotencyKey = `payfast-${payload.pf_payment_id}-${payload.m_payment_id}`;

  await processPaymentCallback("payfast", payload, idempotencyKey);
  return new NextResponse("OK", { status: 200 });
}
