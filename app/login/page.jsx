"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { IMAGES } from "@/components/nursery/data";
import { Leaf } from "lucide-react";

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
      credentials: "same-origin",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!data.success) {
      setError(data.message || "Login failed");
      return;
    }
    router.refresh();
    router.push(redirect);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">Email Address</label>
        <input 
          id="email" 
          type="email" 
          required 
          value={form.email} 
          onChange={(e) => setForm({ ...form, email: e.target.value })} 
          className="mt-2 w-full rounded-2xl border bg-surface-low px-4 py-3 text-sm outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary" 
          placeholder="you@example.com"
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
          <Link href="/forgot-password" className="text-xs font-semibold text-secondary hover:underline">Forgot password?</Link>
        </div>
        <input 
          id="password" 
          type="password" 
          required 
          value={form.password} 
          onChange={(e) => setForm({ ...form, password: e.target.value })} 
          className="mt-2 w-full rounded-2xl border bg-surface-low px-4 py-3 text-sm outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary" 
          placeholder="••••••••"
        />
      </div>
      {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
      <button 
        type="submit" 
        disabled={loading} 
        className="mt-6 w-full rounded-full bg-primary py-3.5 font-bold text-primary-foreground transition hover:bg-forest disabled:opacity-70"
      >
        {loading ? "Signing in..." : "Sign In to Your Account"}
      </button>
      
      <p className="mt-8 text-center text-sm text-muted-foreground">
        New to Noor Nursery?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:text-secondary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <StoreLayout showFlashDeal={false}>
      <div className="flex min-h-[calc(100vh-140px)] flex-col lg:flex-row">
        {/* Left Side: Image */}
        <div className="relative hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:bg-primary lg:p-12">
          <div className="absolute inset-0 z-0 opacity-40">
            <img src={IMAGES.indoor} alt="Lush indoor plants" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-primary/60 mix-blend-multiply"></div>
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-leaf text-leaf-foreground">
              <Leaf className="h-6 w-6" />
            </div>
            <span className="font-display text-xl font-bold text-primary-foreground tracking-tight">NOOR NURSERY</span>
          </div>
          <div className="relative z-10 mt-auto max-w-md">
            <h2 className="font-display text-4xl font-bold leading-tight text-primary-foreground">
              Bring nature into your home.
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Access your order history, manage your addresses, and discover new plants for your collection.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex flex-1 items-center justify-center p-6 lg:w-1/2 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-10 text-center lg:text-left">
              <h1 className="font-display text-3xl font-bold tracking-tight text-primary lg:text-4xl">Welcome back</h1>
              <p className="text-urdu mt-2 text-lg text-secondary" dir="rtl" lang="ur">خوش آمدید</p>
              <p className="mt-2 text-sm text-muted-foreground">Please enter your details to sign in.</p>
            </div>
            
            <Suspense fallback={<div className="mt-8 text-center text-muted-foreground">Loading...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
