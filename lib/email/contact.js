import { Resend } from "resend";
import { getEnv } from "../env";

let resendClient = null;

function getResend() {
  if (resendClient) return resendClient;
  const apiKey = getEnv().RESEND_API_KEY;
  if (!apiKey) return null;
  resendClient = new Resend(apiKey);
  return resendClient;
}

export async function sendEmail({ to, replyTo, subject, html, text }) {
  const resend = getResend();
  const from = getEnv().EMAIL_FROM || "Noor Nursery <onboarding@resend.dev>";

  if (!resend) {
    console.warn("[email] Resend not configured, contact form skipped:", subject);
    return { success: false, skipped: true };
  }

  try {
    const result = await resend.emails.send({ from, to, replyTo, subject, html, text });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("[email] Contact form failed:", error.message);
    return { success: false, error: error.message };
  }
}
