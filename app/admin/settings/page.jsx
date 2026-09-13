"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminSettingsSkeleton } from "@/components/admin/AdminSkeleton";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSettings(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setMessage("");
    setError("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        delivery: settings.delivery,
        store: settings.store,
        bank: settings.bank,
        promo_codes: settings.promo_codes,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.message || "Failed to save");
      return;
    }
    setMessage("Settings saved");
  };

  if (loading || !settings) {
    return (
      <AdminLayout>
        <AdminSettingsSkeleton />
      </AdminLayout>
    );
  }

  const update = (section, field, value) => {
    setSettings((s) => ({ ...s, [section]: { ...s[section], [field]: value } }));
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-primary">Store Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage delivery fees, store info, bank details, and promo codes.</p>

      {message && <p className="mt-4 text-sm text-leaf">{message}</p>}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">Store Info</h2>
          <div className="mt-4 space-y-3">
            {["name", "phone", "email", "address"].map((field) => (
              <div key={field}>
                <label className="block text-xs font-medium capitalize">{field}</label>
                <input
                  value={settings.store[field] || ""}
                  onChange={(e) => update("store", field, e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">Bank Details</h2>
          <div className="mt-4 space-y-3">
            {[
              { id: "accountTitle", label: "Account Title" },
              { id: "accountNumber", label: "Account Number" },
              { id: "bankName", label: "Bank Name" },
              { id: "branch", label: "Branch" },
            ].map((f) => (
              <div key={f.id}>
                <label className="block text-xs font-medium">{f.label}</label>
                <input
                  value={settings.bank[f.id] || ""}
                  onChange={(e) => update("bank", f.id, e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">Delivery Fees</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium">Default Fee (PKR)</label>
              <input
                type="number"
                value={settings.delivery.defaultFee}
                onChange={(e) => update("delivery", "defaultFee", Number(e.target.value))}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Free Delivery Threshold (PKR)</label>
              <input
                type="number"
                value={settings.delivery.freeThreshold}
                onChange={(e) => update("delivery", "freeThreshold", Number(e.target.value))}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">Promo Code — NOOR20</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.promo_codes?.NOOR20?.active ?? true}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    promo_codes: {
                      ...s.promo_codes,
                      NOOR20: { ...s.promo_codes.NOOR20, active: e.target.checked },
                    },
                  }))
                }
              />
              Active
            </label>
            <div>
              <label className="block text-xs font-medium">Discount (%)</label>
              <input
                type="number"
                value={settings.promo_codes?.NOOR20?.value ?? 20}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    promo_codes: {
                      ...s.promo_codes,
                      NOOR20: { ...s.promo_codes.NOOR20, type: "percent", value: Number(e.target.value) },
                    },
                  }))
                }
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>
      </div>

      <button
        type="button"
        onClick={save}
        className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground"
      >
        Save Settings
      </button>
    </AdminLayout>
  );
}
