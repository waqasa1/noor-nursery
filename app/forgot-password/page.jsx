"use client";

import { useState } from "react";
import Link from "next/link";
import { StoreLayout } from "@/components/layout/StoreLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(data.message || "If an account exists, a reset link has been sent.");
  };

  return (
    <StoreLayout showFlashDeal={false}>
      <div className="mx-auto max-w-md px-4 py-14">
        <h1 className="font-display text-3xl font-bold text-primary">Forgot Password</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border bg-card p-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm" />
          </div>
          {message && <p role="status" className="text-sm text-secondary">{message}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-primary py-3 font-bold text-primary-foreground">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <Link href="/login" className="block text-center text-sm text-secondary hover:underline">Back to login</Link>
        </form>
      </div>
    </StoreLayout>
  );
}
