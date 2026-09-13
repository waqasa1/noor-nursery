"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function AdminAccountPage() {
  const [user, setUser] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUser(d.user);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/admin/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!data.success) {
      setError(data.message || "Failed to update password");
      return;
    }

    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setMessage("Password updated successfully");
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-primary">Admin Account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Change your admin login password.</p>

      {user && (
        <p className="mt-4 text-sm text-muted-foreground">
          Signed in as <strong className="text-foreground">{user.email}</strong>
        </p>
      )}

      {message && <p className="mt-4 rounded-xl bg-leaf/10 px-4 py-3 text-sm text-leaf">{message}</p>}
      {error && <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-4 rounded-2xl border bg-card p-6">
        <div>
          <label className="block text-sm font-medium">Current password</label>
          <input
            type="password"
            required
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            className="mt-1 w-full rounded-xl border px-4 py-2 text-sm"
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">New password</label>
          <input
            type="password"
            required
            minLength={8}
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            className="mt-1 w-full rounded-xl border px-4 py-2 text-sm"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Confirm new password</label>
          <input
            type="password"
            required
            minLength={8}
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
            className="mt-1 w-full rounded-xl border px-4 py-2 text-sm"
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-70"
        >
          {submitting ? "Updating…" : "Update Password"}
        </button>
      </form>
    </AdminLayout>
  );
}
