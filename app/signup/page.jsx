"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StoreLayout } from "@/components/layout/StoreLayout";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!data.success) {
      setError(data.message || Object.values(data.errors || {}).flat().join(", ") || "Signup failed");
      return;
    }
    router.push("/account");
  };

  return (
    <StoreLayout showFlashDeal={false}>
      <div className="mx-auto max-w-md px-4 py-14">
        <h1 className="font-display text-3xl font-bold text-primary">Create Account</h1>
        <p className="text-urdu mt-1 text-secondary" dir="rtl" lang="ur">اکاؤنٹ بنائیں</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border bg-card p-6">
          {[
            { id: "name", label: "Full Name", type: "text" },
            { id: "email", label: "Email", type: "email" },
            { id: "phone", label: "Phone", type: "tel" },
            { id: "password", label: "Password", type: "password" },
            { id: "confirmPassword", label: "Confirm Password", type: "password" },
          ].map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="block text-sm font-medium">{f.label}</label>
              <input id={f.id} type={f.type} required value={form[f.id]} onChange={(e) => setForm({ ...form, [f.id]: e.target.value })} className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm" />
            </div>
          ))}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-primary py-3 font-bold text-primary-foreground disabled:opacity-50">
            {loading ? "Creating..." : "Create Account"}
          </button>
          <p className="text-center text-sm">
            Already have an account? <Link href="/login" className="font-semibold text-secondary hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </StoreLayout>
  );
}
