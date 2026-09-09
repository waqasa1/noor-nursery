"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { IMAGES } from "@/components/nursery/data";
import { Leaf } from "lucide-react";

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
      <div className="flex min-h-[calc(100vh-140px)] flex-col lg:flex-row-reverse">
        {/* Right Side: Image */}
        <div className="relative hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:bg-primary lg:p-12">
          <div className="absolute inset-0 z-0 opacity-40">
            <img src={IMAGES.hero} alt="Outdoor plants" className="h-full w-full object-cover" />
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
              Start your green journey.
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Join thousands of plant lovers across Pakistan. Fast delivery, safe packaging, and healthy plants.
            </p>
          </div>
        </div>

        {/* Left Side: Form */}
        <div className="flex flex-1 items-center justify-center p-6 lg:w-1/2 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <h1 className="font-display text-3xl font-bold tracking-tight text-primary lg:text-4xl">Create Account</h1>
              <p className="text-urdu mt-2 text-lg text-secondary" dir="rtl" lang="ur">اکاؤنٹ بنائیں</p>
              <p className="mt-2 text-sm text-muted-foreground">Fill in your details to create an account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { id: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
                { id: "email", label: "Email Address", type: "email", placeholder: "you@example.com" },
                { id: "phone", label: "Phone Number", type: "tel", placeholder: "03XX-XXXXXXX" },
                { id: "password", label: "Password", type: "password", placeholder: "••••••••" },
                { id: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "••••••••" },
              ].map((f) => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-sm font-medium text-foreground">{f.label}</label>
                  <input 
                    id={f.id} 
                    type={f.type} 
                    required 
                    value={form[f.id]} 
                    onChange={(e) => setForm({ ...form, [f.id]: e.target.value })} 
                    className="mt-1 w-full rounded-2xl border bg-surface-low px-4 py-3 text-sm outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary" 
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
              {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
              <button 
                type="submit" 
                disabled={loading} 
                className="mt-6 w-full rounded-full bg-primary py-3.5 font-bold text-primary-foreground transition hover:bg-forest disabled:opacity-70"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
              
              <p className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:text-secondary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
