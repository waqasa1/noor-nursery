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

    setStatus("Thank you! We'll get back to you soon.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <>
      <h2 className="mt-8">Send a Message</h2>
      <form onSubmit={handleSubmit} className="mt-4 max-w-xl space-y-4">
        {[
          { id: "name", label: "Your Name", type: "text", required: true },
          { id: "email", label: "Email", type: "email", required: true },
          { id: "phone", label: "Phone (optional)", type: "tel" },
          { id: "subject", label: "Subject", type: "text", required: true },
        ].map((f) => (
          <div key={f.id}>
            <label htmlFor={f.id} className="block text-sm font-medium">{f.label}</label>
            <input
              id={f.id}
              type={f.type}
              required={f.required}
              value={form[f.id]}
              onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
              className="mt-1 w-full rounded-xl border px-4 py-2 text-sm"
            />
          </div>
        ))}
        <div>
          <label htmlFor="message" className="block text-sm font-medium">Message</label>
          <textarea
            id="message"
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="mt-1 w-full rounded-xl border px-4 py-2 text-sm"
          />
        </div>
        {status && <p className="text-sm text-leaf">{status}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-70"
        >
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </>
  );
}
