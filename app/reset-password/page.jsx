"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { StoreLayout } from "@/components/layout/StoreLayout";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...form }),
    });
    const data = await res.json();
    setLoading(false);
    if (!data.success) {
      setError(data.message || "Reset failed");
      return;
    }
    router.push("/login?reset=success");
  };

  if (!token) {
    return <p className="text-destructive">Invalid reset link.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border bg-card p-6">
      <div>
        <label htmlFor="password" className="block text-sm font-medium">New Password</label>
        <input id="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm Password</label>
        <input id="confirmPassword" type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm" />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-2xl bg-primary py-3 font-bold text-primary-foreground">
        {loading ? "Updating..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <StoreLayout showFlashDeal={false}>
      <div className="mx-auto max-w-md px-4 py-14">
        <h1 className="font-display text-3xl font-bold text-primary">Reset Password</h1>
        <Suspense><ResetForm /></Suspense>
        <Link href="/login" className="mt-4 block text-center text-sm text-secondary hover:underline">Back to login</Link>
      </div>
    </StoreLayout>
  );
}
