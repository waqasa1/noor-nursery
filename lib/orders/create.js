import Order from "@/models/Order";
import Product from "@/models/Product";
import PaymentTransaction from "@/models/PaymentTransaction";
import { connectDB } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils/slug";
import { validateCartItems, buildCartSummary } from "@/lib/cart/validation";
import { calculateDeliveryFeeAsync } from "@/lib/delivery";
import { validatePromoCode } from "@/lib/promo";
import { getPaymentProvider } from "@/lib/payments";
import {
  sendOrderConfirmationEmail,
  sendBankTransferInstructions,
  sendPaymentReceivedEmail,
} from "@/lib/email";
import { bankTransferProvider } from "@/lib/payments/bank-transfer.provider";

export async function decrementStock(items) {
  for (const item of items) {
    const result = await Product.findOneAndUpdate(
      {
        _id: item.productId,
        "variants._id": item.variantId,
        "variants.stock": { $gte: item.quantity },
      },
      { $inc: { "variants.$.stock": -item.quantity } },
      { new: true }
    );
    if (!result) {
      throw new Error(`Insufficient stock for ${item.nameEn}`);
    }
  }
}

export async function restoreStock(items) {
  for (const item of items) {
    await Product.findOneAndUpdate(
      { _id: item.productId, "variants._id": item.variantId },
      { $inc: { "variants.$.stock": item.quantity } }
    );
  }
}

export async function createOrder({
  items,
  customer,
  shippingAddress,
  paymentMethod,
  customerNote,
  promoCode,
  userId,
}) {
  await connectDB();

  const { valid, errors, validatedItems } = await validateCartItems(items);
  if (!valid) {
    return { success: false, errors };
  }

  const subtotal = buildCartSummary(validatedItems).subtotal;
  const deliveryFee = await calculateDeliveryFeeAsync(shippingAddress.city, subtotal);

  let discount = 0;
  let appliedPromo = null;
  if (promoCode) {
    const promoResult = await validatePromoCode(promoCode, subtotal);
    if (!promoResult.valid) {
      return { success: false, errors: [promoResult.error] };
    }
    discount = promoResult.discount;
    appliedPromo = promoResult.promoCode;
  }

  const totals = buildCartSummary(validatedItems, deliveryFee, discount);

  const provider = getPaymentProvider(paymentMethod);
  const orderNumber = generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    userId: userId || undefined,
    customer,
    shippingAddress,
    items: validatedItems.map((i) => ({
      productId: i.productId,
      productSlug: i.productSlug,
      nameEn: i.nameEn,
      nameUr: i.nameUr,
      variantId: i.variantId,
      size: i.size,
      sizeLabelEn: i.sizeLabelEn,
      sizeLabelUr: i.sizeLabelUr,
      sku: i.sku,
      image: i.image,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      lineTotal: i.lineTotal,
    })),
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    discount: totals.discount,
    promoCode: appliedPromo,
    total: totals.total,
    paymentMethod,
    paymentStatus: paymentMethod === "cod" ? "unpaid" : "pending",
    orderStatus: paymentMethod === "cod" ? "pending" : "awaiting_payment",
    customerNote,
  });

  await decrementStock(validatedItems);

  const idempotencyKey = `${orderNumber}-${paymentMethod}-init`;
  await PaymentTransaction.create({
    orderId: order._id,
    orderNumber,
    provider: paymentMethod,
    idempotencyKey,
    amount: order.total,
    status: "initiated",
  });

  const paymentResult = await provider.initiate({ order });

  if (!paymentResult.success) {
    await restoreStock(validatedItems);
    await Order.findByIdAndUpdate(order._id, {
      orderStatus: "cancelled",
      paymentStatus: "failed",
    });
    return { success: false, errors: [paymentResult.error || "Payment initiation failed"] };
  }

  await Order.findByIdAndUpdate(order._id, {
    paymentStatus: paymentResult.paymentStatus,
    orderStatus: paymentResult.orderStatus,
  });

  const updatedOrder = await Order.findById(order._id).lean();

  try {
    await sendOrderConfirmationEmail(updatedOrder);
    if (paymentMethod === "bank_transfer") {
      const bank = await bankTransferProvider.getBankDetailsAsync();
      await sendBankTransferInstructions(updatedOrder, bank);
    }
    await Order.findByIdAndUpdate(order._id, { "emailSent.confirmation": true });
  } catch (e) {
    console.error("[order] Email failed:", e.message);
  }

  return {
    success: true,
    order: updatedOrder,
    payment: paymentResult,
  };
}

export async function processPaymentCallback(providerId, payload, idempotencyKey) {
  await connectDB();

  const existing = await PaymentTransaction.findOne({ idempotencyKey });
  if (existing?.status === "success") {
    return { success: true, duplicate: true, orderNumber: existing.orderNumber };
  }

  const provider = getPaymentProvider(providerId);
  const result = await provider.handleCallback(payload);

  if (!result.verified) {
    return { success: false, error: result.error };
  }

  const order = await Order.findOne({ orderNumber: result.orderNumber });
  if (!order) return { success: false, error: "Order not found" };

  if (order.paymentStatus === "paid") {
    return { success: true, duplicate: true, orderNumber: order.orderNumber };
  }

  await Order.findByIdAndUpdate(order._id, {
    paymentStatus: result.paymentStatus,
    orderStatus: result.orderStatus,
    paymentReference: result.reference,
    paymentGatewayResponse: payload,
  });

  await PaymentTransaction.findOneAndUpdate(
    { idempotencyKey },
    {
      status: result.success ? "success" : "failed",
      externalReference: result.reference,
      rawResponse: payload,
      processedAt: new Date(),
    },
    { upsert: true }
  );

  if (result.success) {
    const updatedOrder = await Order.findById(order._id).lean();
    sendPaymentReceivedEmail(updatedOrder).catch((e) => {
      console.error("[order] Payment email failed:", e.message);
    });
  }

  return { success: result.success, orderNumber: order.orderNumber };
}
