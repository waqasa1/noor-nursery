"use client";

import { useState } from "react";

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setStatus("");
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!data.success) {
      setError(data.message || "Failed to send message");
      return;
    }

    setStatus("Thank you — we’ll reply soon.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const fieldClass =
    "mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { id: "name", label: "Your name", type: "text", required: true, autoComplete: "name" },
          { id: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
          { id: "phone", label: "Phone (optional)", type: "tel", autoComplete: "tel" },
          { id: "subject", label: "Subject", type: "text", required: true },
        ].map((f) => (
          <div key={f.id} className={f.id === "subject" ? "sm:col-span-2" : undefined}>
            <label htmlFor={f.id} className="block text-sm font-semibold text-foreground">
              {f.label}
            </label>
            <input
              id={f.id}
              type={f.type}
              required={f.required}
              autoComplete={f.autoComplete}
              value={form[f.id]}
              onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
              className={fieldClass}
            />
          </div>
        ))}
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-foreground">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={`${fieldClass} resize-y`}
        />
      </div>
      {status ? <p className="text-sm font-medium text-secondary">{status}</p> : null}
      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground transition hover:bg-forest disabled:pointer-events-none disabled:opacity-70 sm:w-auto sm:px-10"
      >
        {submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
