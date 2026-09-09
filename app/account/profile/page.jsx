"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreLayout } from "@/components/layout/StoreLayout";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) router.push("/login?redirect=/account/profile");
        else setUser(data.user);
      });
  }, [router]);

  if (!user) return null;

  return (
    <StoreLayout showFlashDeal={false}>
      <div className="mx-auto max-w-md px-4 py-10">
        <Link href="/account" className="text-sm text-secondary hover:underline">← Account</Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-primary">Profile</h1>
        <div className="mt-8 rounded-2xl border bg-card p-6 space-y-3">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>
    </StoreLayout>
  );
}
