"use client";

import { useState } from "react";
import Link from "next/link";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { IMAGES } from "@/components/nursery/data";
import { Leaf } from "lucide-react";

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
      <div className="flex min-h-[calc(100vh-140px)] flex-col lg:flex-row">
        {/* Left Side: Image */}
        <div className="relative hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:bg-primary lg:p-12">
          <div className="absolute inset-0 z-0 opacity-40">
            <img src={IMAGES.fruitTrees} alt="Fruit trees" className="h-full w-full object-cover" />
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
              Forgot your password?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Don't worry, it happens to the best of us. We'll help you get back to your plants in no time.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex flex-1 items-center justify-center p-6 lg:w-1/2 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-10 text-center lg:text-left">
              <h1 className="font-display text-3xl font-bold tracking-tight text-primary lg:text-4xl">Reset Password</h1>
              <p className="mt-2 text-sm text-muted-foreground">Enter your email address and we'll send you a link to reset your password.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">Email Address</label>
                <input 
                  id="email" 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="mt-2 w-full rounded-2xl border bg-surface-low px-4 py-3 text-sm outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary" 
                  placeholder="you@example.com"
                />
              </div>
              {message && (
                <div className="rounded-xl bg-leaf/10 p-4 text-sm font-medium text-leaf">
                  {message}
                </div>
              )}
              <button 
                type="submit" 
                disabled={loading} 
                className="mt-6 w-full rounded-full bg-primary py-3.5 font-bold text-primary-foreground transition hover:bg-forest disabled:opacity-70"
              >
                {loading ? "Sending link..." : "Send Reset Link"}
              </button>
              
              <p className="mt-8 text-center text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link href="/login" className="font-semibold text-primary hover:text-secondary hover:underline">
                  Back to login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
