"use client";

import { useEffect, useState } from "react";
import { AdminSettingsSkeleton } from "@/components/admin/AdminSkeleton";
import { Zap, Image as ImageIcon, Globe, Share2 } from "lucide-react";

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
        easypaisa: settings.easypaisa,
        promo_codes: settings.promo_codes,
        banner: settings.banner,
        site_content: settings.site_content,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.message || "Failed to save");
      return;
    }
    setMessage("Settings saved successfully!");
    setTimeout(() => setMessage(""), 4000);
  };

  if (loading || !settings) {
    return <AdminSettingsSkeleton />;
  }

  const update = (section, field, value) => {
    setSettings((s) => ({ ...s, [section]: { ...s[section], [field]: value } }));
  };

  const banner = settings.banner ?? { active: true, text: "Limited offer:", subtext: "Flat 20% off your order — free shipping over PKR 2,500", code: "NOOR20" };
  const site_content = settings.site_content ?? { heroImage: "", indoorImage: "", aboutImage: "", facebookUrl: "", instagramUrl: "", copyrightText: "Noor Nursery Pakistan. All rights reserved." };

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-primary">Store Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage delivery fees, store info, banner, images, social links, and promo codes.
      </p>

      {message && <p className="mt-4 rounded-xl bg-leaf/10 px-4 py-3 text-sm font-medium text-leaf">{message}</p>}
      {error && <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        {/* ── Banner / Flash Deal ── */}
        <section className="rounded-2xl border-2 border-gold/40 bg-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-gold" />
            <h2 className="font-semibold">Flash Deal Banner</h2>
            <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm">
              <span className="text-muted-foreground">Active</span>
              <input
                type="checkbox"
                checked={banner.active ?? true}
                onChange={(e) => update("banner", "active", e.target.checked)}
                className="h-4 w-4"
              />
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${banner.active ? "bg-leaf/20 text-leaf-foreground" : "bg-muted text-muted-foreground"}`}>
                {banner.active ? "Showing" : "Hidden"}
              </span>
            </label>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Controls the gold banner shown below the top bar. Toggle active to show/hide it.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium">Bold Label (e.g. "Limited offer:")</label>
              <input
                value={banner.text ?? ""}
                onChange={(e) => update("banner", "text", e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="Limited offer:"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Description text</label>
              <input
                value={banner.subtext ?? ""}
                onChange={(e) => update("banner", "subtext", e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="Flat 20% off your order — free shipping over PKR 2,500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Promo Code (leave empty to hide)</label>
              <input
                value={banner.code ?? ""}
                onChange={(e) => update("banner", "code", e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-mono"
                placeholder="NOOR20"
              />
            </div>
          </div>
          {/* Live preview */}
          {banner.active && (
            <div className="mt-4 rounded-xl bg-yellow-400 px-4 py-2.5 text-center text-sm text-yellow-900">
              <span className="mr-2">⚡</span>
              <span className="font-bold">{banner.text || "Limited offer:"}</span>
              {" "}{banner.subtext || "Flat 20% off your order"}
              {banner.code && (
                <span className="ml-2 rounded bg-yellow-900 px-2 py-0.5 font-mono text-xs font-bold text-yellow-400">
                  Code: {banner.code}
                </span>
              )}
            </div>
          )}
        </section>

        {/* ── Store Info ── */}
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

        {/* ── Social Links & Branding ── */}
        <section className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-secondary" />
            <h2 className="font-semibold">Social Links &amp; Branding</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            These appear in the footer. Phone is taken from Store Info above.
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium">Facebook URL</label>
              <input
                value={site_content.facebookUrl ?? ""}
                onChange={(e) => update("site_content", "facebookUrl", e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="https://www.facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Instagram URL</label>
              <input
                value={site_content.instagramUrl ?? ""}
                onChange={(e) => update("site_content", "instagramUrl", e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="https://www.instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Copyright Text (after © year)</label>
              <input
                value={site_content.copyrightText ?? ""}
                onChange={(e) => update("site_content", "copyrightText", e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="Noor Nursery Pakistan. All rights reserved."
              />
            </div>
          </div>
        </section>

        {/* ── Site Images ── */}
        <section className="rounded-2xl border bg-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-secondary" />
            <h2 className="font-semibold">Site Images</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Paste an image URL or upload path. Leave empty to use the default image.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { field: "heroImage", label: "Hero Banner Image", placeholder: "/heroimage-clean.png" },
              { field: "indoorImage", label: "Indoor Collection Image", placeholder: "https://..." },
              { field: "aboutImage", label: "About Us / Brand Story Image", placeholder: "https://..." },
            ].map(({ field, label, placeholder }) => (
              <div key={field}>
                <label className="block text-xs font-medium">{label}</label>
                <input
                  value={site_content[field] ?? ""}
                  onChange={(e) => update("site_content", field, e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder={placeholder}
                />
                {site_content[field] && (
                  <img
                    src={site_content[field]}
                    alt={label}
                    className="mt-2 h-24 w-full rounded-xl object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── JazzCash ── */}
        <section className="rounded-2xl border-2 border-secondary/40 bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">JazzCash Account (checkout)</h2>
            <span className="rounded-full bg-leaf/25 px-2.5 py-1 text-[11px] font-bold text-leaf-foreground">
              Active method
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Customers pay by JazzCash Send Money to this number, then submit their TID / TrxID. Leave both fields
            empty to hide JazzCash and show only Cash on Delivery.
          </p>
          <div className="mt-4 space-y-3">
            {[
              { id: "accountTitle", label: "Account Title (name on the JazzCash account)" },
              { id: "accountNumber", label: "JazzCash Number" },
            ].map((f) => (
              <div key={f.id}>
                <label className="block text-xs font-medium">{f.label}</label>
                <input
                  value={settings.easypaisa?.[f.id] || ""}
                  onChange={(e) => update("easypaisa", f.id, e.target.value)}
                  placeholder={f.id === "accountNumber" ? "03XX-XXXXXXX" : "Noor Nursery"}
                  className="field-input mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Bank Details ── */}
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">Bank Details</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Kept for records — bank transfer is no longer offered at checkout.
          </p>
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

        {/* ── Delivery Fees ── */}
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

        {/* ── Promo Code ── */}
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
        className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:bg-forest transition"
      >
        Save All Settings
      </button>
    </>
  );
}
