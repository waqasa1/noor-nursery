import { z } from "zod";
import { rateLimitAsync, getClientIp } from "@/lib/auth/rate-limit";
import { getStoreInfo } from "@/lib/settings";
import { getEnv } from "@/lib/env";
import { sendEmail, getContactInbox } from "@/lib/email";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(3),
  message: z.string().min(10).max(2000),
});

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = await rateLimitAsync(`contact:${ip}`, { maxAttempts: 5, windowMs: 60 * 60 * 1000 });
    if (!limit.allowed) {
      return jsonError("Too many messages. Please try again later.", 429);
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Please fill in all required fields", 400);
    }

    const store = await getStoreInfo();
    const env = getEnv();
    const to = env.CONTACT_TO || env.EMAIL_REPLY_TO || store.email || getContactInbox();

    const result = await sendEmail({
      to,
      replyTo: parsed.data.email,
      subject: `[Contact] ${parsed.data.subject}`,
      html: `
        <p><strong>From:</strong> ${parsed.data.name} (${parsed.data.email})</p>
        ${parsed.data.phone ? `<p><strong>Phone:</strong> ${parsed.data.phone}</p>` : ""}
        <p><strong>Subject:</strong> ${parsed.data.subject}</p>
        <p>${parsed.data.message.replace(/\n/g, "<br>")}</p>
      `,
      text: `${parsed.data.name} <${parsed.data.email}>: ${parsed.data.message}`,
    });

    if (result?.skipped) {
      return jsonError(
        "Email is not configured on the server. Please WhatsApp or call the store instead.",
        503
      );
    }
    if (!result?.success) {
      return jsonError(
        "We could not send your message right now. Please try WhatsApp or call the store.",
        502
      );
    }

    return jsonSuccess({ message: "Message sent" });
  } catch (error) {
    return handleApiError(error);
  }
}
