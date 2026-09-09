import { Resend } from "resend";
import { getEnv } from "../env";
import { formatPKR } from "../utils/currency";

let resendClient = null;

function getResend() {
  if (resendClient) return resendClient;
  const apiKey = getEnv().RESEND_API_KEY;
  if (!apiKey) return null;
  resendClient = new Resend(apiKey);
  return resendClient;
}

async function sendEmail({ to, subject, html, text }) {
  const resend = getResend();
  const from = getEnv().EMAIL_FROM || "Noor Nursery <onboarding@resend.dev>";

  if (!resend) {
    console.warn("[email] Resend not configured, skipping:", subject, "to", to);
    return { success: false, skipped: true };
  }

  try {
    const result = await resend.emails.send({ from, to, subject, html, text });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("[email] Failed to send:", subject, error.message);
    return { success: false, error: error.message };
  }
}

function baseTemplate(content) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1a3a2a">${content}<hr style="margin-top:30px;border:none;border-top:1px solid #ddd"><p style="font-size:12px;color:#666">Noor Nursery — Pakistan's Living Heritage</p></body></html>`;
}

export async function sendWelcomeEmail(user) {
  const html = baseTemplate(`
    <h1>Welcome to Noor Nursery!</h1>
    <p>Hello ${user.name},</p>
    <p>Thank you for creating an account. Browse our collection of acclimatized plants for Pakistani homes and gardens.</p>
    <p dir="rtl" lang="ur" style="font-family:serif">نور نرسری میں خوش آمدید! پاکستانی گھروں اور باغات کے لیے موزوں پودے دیکھیں۔</p>
  `);
  return sendEmail({
    to: user.email,
    subject: "Welcome to Noor Nursery",
    html,
    text: `Welcome to Noor Nursery, ${user.name}!`,
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
    <p>If you didn't make this change, contact us immediately.</p>
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
  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr><td>${i.nameEn}<br><span dir="rtl" lang="ur">${i.nameUr}</span><br><small>${i.sizeLabelEn}</small></td><td>${i.quantity}</td><td>${formatPKR(i.lineTotal)}</td></tr>`
    )
    .join("");

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
    <p><strong>Payment:</strong> ${order.paymentMethod.replace("_", " ")}</p>
    <p dir="rtl" lang="ur" style="font-family:serif">آپ کا آرڈر موصول ہو گیا۔ شکریہ!</p>
  `);

  return sendEmail({
    to: order.customer.email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html,
    text: `Order ${order.orderNumber} confirmed. Total: ${formatPKR(order.total)}`,
  });
}

export async function sendBankTransferInstructions(order, bankDetails) {
  const html = baseTemplate(`
    <h1>Bank Transfer Instructions — ${order.orderNumber}</h1>
    <p>Please transfer ${formatPKR(order.total)} to:</p>
    <ul>
      <li><strong>Account Title:</strong> ${bankDetails.accountTitle}</li>
      <li><strong>Account Number:</strong> ${bankDetails.accountNumber}</li>
      <li><strong>Bank:</strong> ${bankDetails.bankName}</li>
      <li><strong>Reference:</strong> ${order.orderNumber}</li>
    </ul>
    <p dir="rtl" lang="ur" style="font-family:serif">براہ کرم رقم منتقل کریں اور آرڈر نمبر بطور حوالہ استعمال کریں۔</p>
  `);
  return sendEmail({
    to: order.customer.email,
    subject: `Bank Transfer Instructions — ${order.orderNumber}`,
    html,
    text: `Transfer ${formatPKR(order.total)} to ${bankDetails.accountNumber}. Reference: ${order.orderNumber}`,
  });
}

export async function sendOrderStatusUpdate(order, statusMessage) {
  const html = baseTemplate(`
    <h1>Order Update — ${order.orderNumber}</h1>
    <p>Hello ${order.customer.name},</p>
    <p>${statusMessage}</p>
    <p><strong>Status:</strong> ${order.orderStatus.replace("_", " ")}</p>
    <p dir="rtl" lang="ur" style="font-family:serif">آپ کے آرڈر کی تازہ ترین معلومات۔</p>
  `);
  return sendEmail({
    to: order.customer.email,
    subject: `Order Update — ${order.orderNumber}`,
    html,
    text: `Order ${order.orderNumber}: ${statusMessage}`,
  });
}

export async function sendPaymentReceivedEmail(order) {
  return sendOrderStatusUpdate(order, "We have received your payment. Your order is being processed.");
}
