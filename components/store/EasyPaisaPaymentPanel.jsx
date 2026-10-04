"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Copy, Loader2, Send } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

function CopyRow({ label, value, mono = false }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span className={`${mono ? "font-mono" : "font-semibold"} text-foreground`}>{value}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${label}`}
          className="rounded-lg border p-1.5 text-muted-foreground transition hover:border-secondary hover:text-secondary"
        >
          {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-leaf" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </span>
    </div>
  );
}

export function EasyPaisaPaymentPanel({
  orderNumber,
  amount,
  accountTitle,
  accountNumber,
  paymentStatus,
  paymentReference,
  orderStatus,
}) {
  const router = useRouter();
  const [trxId, setTrxId] = useState(paymentReference || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const confirmed = paymentStatus === "paid";
  const submitted = !confirmed && !!paymentReference;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!trxId.trim()) {
      setError("Paste the TrxID from your EasyPaisa confirmation SMS.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders/payment-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, trxId: trxId.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || data.error || "Could not submit. Please try again.");
        return;
      }
      setSuccess(data.message || "Transaction ID submitted.");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 rounded-2xl border-2 border-secondary/40 bg-surface-low p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">EasyPaisa Payment</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Send the exact amount, then paste your TrxID below. Your order ships once we verify the transfer.
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
            confirmed
              ? "bg-leaf/25 text-leaf-foreground"
              : submitted
                ? "bg-gold/25 text-gold-foreground"
                : "bg-destructive/10 text-destructive"
          }`}
        >
          {confirmed ? "Payment received" : submitted ? "Verification pending" : "Payment required"}
        </span>
      </div>

      <div className="mt-4 space-y-2.5 rounded-xl border bg-card p-4">
        <CopyRow label="Amount to send" value={`PKR ${Number(amount || 0).toLocaleString()}`} />
        <CopyRow label="Account Title" value={accountTitle || "—"} />
        <CopyRow label="EasyPaisa Number" value={accountNumber || "—"} mono />
        <div className="flex items-center justify-between gap-3 border-t pt-2.5">
          <span className="text-sm text-muted-foreground">Order</span>
          <span className="font-bold text-primary">{orderNumber}</span>
        </div>
      </div>

      <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed text-muted-foreground">
        <li>Open your EasyPaisa app → <strong className="text-foreground">Send Money</strong> → Wallet / EasyPaisa number.</li>
        <li>Send <strong className="text-foreground">PKR {Number(amount || 0).toLocaleString()}</strong> exactly — no more, no less.</li>
        <li>Open the confirmation SMS and copy the <strong className="text-foreground">TrxID</strong>.</li>
        <li>Paste it here. We check it in our own EasyPaisa account and mark your order paid.</li>
      </ol>

      {confirmed ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-leaf/15 p-4 text-sm text-leaf-foreground">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Payment confirmed — thank you! Order <span className="font-bold">{orderNumber}</span> is now being
            prepared for dispatch (status: <span className="font-bold">{orderStatus}</span>).
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3">
          {submitted && (
            <p className="rounded-xl bg-gold/15 p-3 text-xs text-gold-foreground">
              Submitted TrxID: <span className="font-mono font-bold">{paymentReference}</span> — waiting for
              verification. You can correct it below if you copied it wrong.
            </p>
          )}
          <label htmlFor="trxId" className="block text-sm font-medium text-foreground">
            EasyPaisa Transaction ID (TrxID)
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="trxId"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value.toUpperCase())}
              placeholder="e.g. 2609151234567890"
              autoComplete="off"
              className="flex-1 rounded-xl border-2 border-foreground/15 bg-card px-4 py-3 font-mono text-sm uppercase outline-none transition focus:border-secondary"
            />
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-forest disabled:opacity-70"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? "Submitting…" : "Submit TrxID"}
            </button>
          </div>
          {error && (
            <p className="flex items-start gap-2 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
            </p>
          )}
          {success && (
            <p className="flex items-start gap-2 text-xs text-leaf-foreground">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {success}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Don't have the SMS yet?{" "}
            <a
              href={buildWhatsAppUrl(`Hi Noor Nursery! I just submitted the EasyPaisa TrxID for order ${orderNumber}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-secondary hover:underline"
            >
              Send it on WhatsApp
            </a>{" "}
            — we can also verify it for you.
          </p>
        </form>
      )}
    </div>
  );
}
