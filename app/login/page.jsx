"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { StoreLayout } from "@/components/layout/StoreLayout";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!data.success) {
      setError(data.message || "Login failed");
      return;
    }
    router.push(redirect);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border bg-card p-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">Password</label>
        <input id="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm" />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-2xl bg-primary py-3 font-bold text-primary-foreground disabled:opacity-50">
        {loading ? "Signing in..." : "Sign In"}
      </button>
      <p className="text-center text-sm">
        <Link href="/forgot-password" className="text-secondary hover:underline">Forgot password?</Link>
      </p>
      <p className="text-center text-sm">
        No account? <Link href="/signup" className="font-semibold text-secondary hover:underline">Sign up</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <StoreLayout showFlashDeal={false}>
      <div className="mx-auto max-w-md px-4 py-14">
        <h1 className="font-display text-3xl font-bold text-primary">Login</h1>
        <p className="text-urdu mt-1 text-secondary" dir="rtl" lang="ur">لاگ ان</p>
        <Suspense fallback={<div className="mt-8 text-center text-muted-foreground">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </StoreLayout>
  );
}
