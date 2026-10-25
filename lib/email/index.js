import { Resend } from "resend";
import { getEnv } from "../env";
import { formatPKR } from "../utils/currency";
import { orderSuccessPath } from "../orders/access";

let resendClient = null;

function getResend() {
  if (resendClient) return resendClient;
  const apiKey = getEnv().RESEND_API_KEY;
  if (!apiKey) return null;
  resendClient = new Resend(apiKey);
  return resendClient;
}

function appBaseUrl() {
  return (getEnv().NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
}

/** Human inbox for Reply-To / contact (Spaceship forward → Gmail). */
export function getEmailReplyTo() {
  const env = getEnv();
  return (
    env.EMAIL_REPLY_TO ||
    env.CONTACT_TO ||
    env.NEXT_PUBLIC_STORE_EMAIL ||
    "support@noornursery.com"
  );
}

export function getContactInbox() {
  const env = getEnv();
  return env.CONTACT_TO || env.EMAIL_REPLY_TO || env.NEXT_PUBLIC_STORE_EMAIL || "support@noornursery.com";
}

/**
 * Shared Resend send. Sets Reply-To to support@ so customer replies hit forwarding.
 */
export async function sendEmail({ to, replyTo, subject, html, text }) {
  const resend = getResend();
  const from = getEnv().EMAIL_FROM || "Noor Nursery <onboarding@resend.dev>";
  const defaultReplyTo = getEmailReplyTo();

  if (!resend) {
    console.warn("[email] Resend not configured, skipping:", subject, "to", to);
    return { success: false, skipped: true };
  }

  try {
    const payload = {
      from,
      to,
      subject,
      html,
      text,
      replyTo: replyTo || defaultReplyTo,
    };
    const result = await resend.emails.send(payload);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("[email] Failed to send:", subject, error.message);
    return { success: false, error: error.message };
  }
}

function baseTemplate(content) {
  const support = getEmailReplyTo();
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1a3a2a">${content}<hr style="margin-top:30px;border:none;border-top:1px solid #ddd"><p style="font-size:12px;color:#666">Noor Nursery — Pakistan's Living Heritage<br>Questions? Reply to this email or write <a href="mailto:${support}">${support}</a></p></body></html>`;
}

function orderLinks(order) {
  const base = appBaseUrl();
  const viewPath = order.accessToken
    ? orderSuccessPath(order.orderNumber, order.accessToken)
    : `/track-order?order=${encodeURIComponent(order.orderNumber)}`;
  const viewUrl = `${base}${viewPath}`;
  const trackUrl = `${base}/track-order?order=${encodeURIComponent(order.orderNumber)}`;
  return { viewUrl, trackUrl };
}

function orderLinksHtml(order) {
  const { viewUrl, trackUrl } = orderLinks(order);
  return `
    <p style="margin:24px 0">
      <a href="${viewUrl}" style="background:#1a5c3a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold">View order</a>
    </p>
    <p style="font-size:13px;color:#555">Or <a href="${trackUrl}">track your order</a> with your order number and email/phone.</p>
  `;
}

const PAYMENT_LABELS = {
  cod: "Cash on Delivery",
  easypaisa: "EasyPaisa (legacy)",
  bank_transfer: "Bank Transfer",
  jazzcash: "JazzCash (Send Money)",
  payfast: "PayFast",
};

const STATUS_LABELS = {
  pending: "Pending",
  awaiting_payment: "Awaiting payment",
  payment_review: "Payment under review",
  paid: "Paid — preparing your order",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

/** Customer-facing copy when order status changes to a milestone. */
export const MILESTONE_STATUS_MESSAGES = {
  processing: "We’re preparing your plants for dispatch.",
  packed: "Your order is packed and almost on its way.",
  shipped: "Great news — your order has been shipped! You’ll receive it soon.",
  delivered: "Your order has been marked as delivered. We hope your plants settle in beautifully.",
  cancelled: "Your order has been cancelled. If you have questions, just reply to this email.",
};

export function formatOrderStatus(status) {
  return STATUS_LABELS[status] || String(status || "").replace(/_/g, " ");
}

export async function sendWelcomeEmail(user) {
  const shopUrl = `${appBaseUrl()}/shop`;
  const html = baseTemplate(`
    <h1>Welcome to Noor Nursery!</h1>
    <p>Hello ${user.name},</p>
    <p>Thank you for creating an account. Browse our collection of acclimatized plants for Pakistani homes and gardens.</p>
    <p><a href="${shopUrl}" style="background:#1a5c3a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold">Shop plants</a></p>
    <p dir="rtl" lang="ur" style="font-family:serif">نور نرسری میں خوش آمدید! پاکستانی گھروں اور باغات کے لیے موزوں پودے دیکھیں۔</p>
  `);
  return sendEmail({
    to: user.email,
    subject: "Welcome to Noor Nursery",
    html,
    text: `Welcome to Noor Nursery, ${user.name}! Shop: ${shopUrl}`,
  });
}

export async function sendPasswordResetEmail(email, resetUrl) {
  const html = baseTemplate(`
    <h1>Reset Your Password</h1>
    <p>Click the link below to reset your password. This link expires in 1 hour.</p>
    <p><a href="${resetUrl}" style="background:#1a5c3a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Reset Password</a></p>
    <p>If you didn't request this, ignore this email.</p>
    <p dir="rtl" lang="ur" style="font-family:serif">اپنا پاس ورڈ ری سیٹ کرنے کے لیے اوپر والے لنک پر کلک کریں۔</p>
  `);
  return sendEmail({
    to: email,
    subject: "Reset your Noor Nursery password",
    html,
    text: `Reset your password: ${resetUrl}`,
  });
}

export async function sendPasswordChangedEmail(email, name) {
  const html = baseTemplate(`
    <h1>Password Changed</h1>
    <p>Hello ${name}, your password was successfully changed.</p>
    <p>If you didn't make this change, contact us immediately by replying to this email.</p>
    <p dir="rtl" lang="ur" style="font-family:serif">آپ کا پاس ورڈ تبدیل ہو گیا ہے۔</p>
  `);
  return sendEmail({
    to: email,
    subject: "Your Noor Nursery password was changed",
    html,
    text: `Hello ${name}, your password was changed.`,
  });
}

export async function sendOrderConfirmationEmail(order) {
  const itemsHtml = (order.items || [])
    .map(
      (i) =>
        `<tr><td>${i.nameEn}<br><span dir="rtl" lang="ur">${i.nameUr || ""}</span><br><small>${i.sizeLabelEn || ""}</small></td><td>${i.quantity}</td><td>${formatPKR(i.lineTotal)}</td></tr>`
    )
    .join("");

  const { viewUrl, trackUrl } = orderLinks(order);
  const prepaid = order.paymentMethod === "jazzcash" || order.paymentMethod === "easypaisa";

  const html = baseTemplate(`
    <h1>Order Confirmed — ${order.orderNumber}</h1>
    <p>Thank you ${order.customer.name}! Your order has been received.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0">
      <thead><tr style="background:#f0f7f2"><th align="left">Item</th><th>Qty</th><th>Total</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p><strong>Subtotal:</strong> ${formatPKR(order.subtotal)}</p>
    <p><strong>Delivery:</strong> ${formatPKR(order.deliveryFee)}</p>
    <p><strong>Total:</strong> ${formatPKR(order.total)}</p>
    <p><strong>Payment:</strong> ${PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod.replace("_", " ")}</p>${
      prepaid
        ? `<p><strong>Next step:</strong> send ${formatPKR(order.total)} from your JazzCash app (Send Money), then paste the TID / TrxID on your order page. We ship after verifying it.</p>`
        : ""
    }
    ${orderLinksHtml(order)}
    <p dir="rtl" lang="ur" style="font-family:serif">آپ کا آرڈر موصول ہو گیا۔ شکریہ!</p>
  `);

  return sendEmail({
    to: order.customer.email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html,
    text: `Order ${order.orderNumber} confirmed. Total: ${formatPKR(order.total)}. View: ${viewUrl} Track: ${trackUrl}`,
  });
}

export async function sendJazzCashInstructions(order, account) {
  const { viewUrl, trackUrl } = orderLinks(order);

  const html = baseTemplate(`
    <h1>JazzCash Payment — ${order.orderNumber}</h1>
    <p>Please send <strong>${formatPKR(order.total)}</strong> from your JazzCash app (Send Money):</p>
    <ul>
      <li><strong>Account Title:</strong> ${account.accountTitle}</li>
      <li><strong>JazzCash Number:</strong> ${account.accountNumber}</li>
      <li><strong>Amount:</strong> ${formatPKR(order.total)}</li>
      <li><strong>Order:</strong> ${order.orderNumber}</li>
    </ul>
    <p>After sending, copy the <strong>TID / TrxID</strong> from the confirmation SMS (or JazzCash → My Account → Transaction History) and submit it on your order page.
    We verify every transfer in our own JazzCash app before shipping — once you see "Payment received",
    your order is confirmed and cannot be cancelled.</p>
    ${orderLinksHtml(order)}
    <p dir="rtl" lang="ur" style="font-family:serif">رقم بھیجنے کے بعد TID ویب سائٹ پر جمع کرائیں۔ تصدیق کے بعد آرڈر بھیجا جائے گا۔</p>
  `);
  return sendEmail({
    to: order.customer.email,
    subject: `JazzCash Payment Instructions — ${order.orderNumber}`,
    html,
    text: `Send ${formatPKR(order.total)} to JazzCash ${account.accountNumber} (Title: ${account.accountTitle}) for order ${order.orderNumber}. Submit TID: ${viewUrl} Track: ${trackUrl}`,
  });
}

/** @deprecated use sendJazzCashInstructions */
export async function sendEasyPaisaInstructions(order, account) {
  return sendJazzCashInstructions(order, account);
}

export async function sendOrderStatusUpdate(order, statusMessage) {
  const { viewUrl, trackUrl } = orderLinks(order);
  const statusLabel = formatOrderStatus(order.orderStatus);

  const html = baseTemplate(`
    <h1>Order Update — ${order.orderNumber}</h1>
    <p>Hello ${order.customer.name},</p>
    <p>${statusMessage}</p>
    <p><strong>Status:</strong> ${statusLabel}</p>
    <p><strong>Total:</strong> ${formatPKR(order.total)}</p>
    ${orderLinksHtml(order)}
    <p dir="rtl" lang="ur" style="font-family:serif">آپ کے آرڈر کی تازہ ترین معلومات۔</p>
  `);
  return sendEmail({
    to: order.customer.email,
    subject: `Order Update — ${order.orderNumber} (${statusLabel})`,
    html,
    text: `Order ${order.orderNumber}: ${statusMessage} Status: ${statusLabel}. View: ${viewUrl} Track: ${trackUrl}`,
  });
}

export async function sendPaymentReceivedEmail(order) {
  return sendOrderStatusUpdate(
    order,
    "We have received your payment. Your order is being processed and will ship soon."
  );
}

/** Customer submitted JazzCash TID — awaiting seller verification. */
export async function sendTidReceivedEmail(order) {
  const { viewUrl, trackUrl } = orderLinks(order);
  const html = baseTemplate(`
    <h1>TID received — ${order.orderNumber}</h1>
    <p>Hello ${order.customer.name},</p>
    <p>We received your JazzCash transaction ID
      ${order.paymentReference ? `(<strong>${order.paymentReference}</strong>)` : ""}.
      We’re verifying it in our JazzCash account — usually within a few hours during business time.</p>
    <p>You’ll get another email when payment is confirmed.</p>
    ${orderLinksHtml(order)}
    <p dir="rtl" lang="ur" style="font-family:serif">آپ کا TID موصول ہو گیا۔ تصدیق کے بعد آپ کو اطلاع دی جائے گی۔</p>
  `);
  return sendEmail({
    to: order.customer.email,
    subject: `TID received — ${order.orderNumber}`,
    html,
    text: `We received your JazzCash TID for order ${order.orderNumber}. View: ${viewUrl} Track: ${trackUrl}`,
  });
}
