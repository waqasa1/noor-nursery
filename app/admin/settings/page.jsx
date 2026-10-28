"use client";

import { useEffect, useState } from "react";
import { AdminSettingsSkeleton } from "@/components/admin/AdminSkeleton";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { DEFAULT_CITY_FEES, titleCaseCity } from "@/lib/delivery-defaults";
import { invalidateSiteSettingsCache } from "@/lib/useSiteSettings";
import { Zap, Image as ImageIcon, Share2, Loader2, Plus, Trash2 } from "lucide-react";

function normalizePromoCode(raw) {
  return String(raw || "").trim().toUpperCase();
}

/** Keep a single checkout promo that matches the Flash Deal banner code. */
function syncPromoToBanner(promoCodes, banner, discountValue, active) {
  const code = normalizePromoCode(banner?.code);
  if (!code) return promoCodes || {};

  const existing =
    promoCodes?.[code] ||
    Object.values(promoCodes || {}).find(
      (p) => normalizePromoCode(p?.code) === code
    ) ||
    Object.values(promoCodes || {})[0] ||
    {};

  const value =
    typeof discountValue === "number"
      ? discountValue
      : Number(existing.value ?? 20);

  return {
    [code]: {
      code,
      type: "percent",
      value: Number.isFinite(value) ? value : 20,
      minSubtotal: existing.minSubtotal ?? 0,
      active: typeof active === "boolean" ? active : existing.active ?? true,
      label: existing.label || `${Number.isFinite(value) ? value : 20}% off your order`,
    },
  };
}

function DeliveryFeesSection({ delivery, onUpdate, onReplaceCityFees }) {
  const [newCity, setNewCity] = useState("");
  const [newFee, setNewFee] = useState("");
  const cityFees = { ...DEFAULT_CITY_FEES, ...(delivery?.cityFees || {}) };
  const rows = Object.entries(cityFees).sort(([a], [b]) => a.localeCompare(b));

  const setCityFee = (city, fee) => {
    const key = String(city).trim().toLowerCase();
    if (!key) return;
    onReplaceCityFees({ ...cityFees, [key]: Number(fee) || 0 });
  };

  const removeCity = (city) => {
    const next = { ...cityFees };
    delete next[city];
    onReplaceCityFees(next);
  };

  const addCity = (e) => {
    e.preventDefault();
    const key = String(newCity).trim().toLowerCase();
    if (!key) return;
    onReplaceCityFees({ ...cityFees, [key]: Number(newFee) || 0 });
    setNewCity("");
    setNewFee("");
  };

  return (
    <section className="rounded-2xl border bg-card p-5 lg:col-span-2">
      <h2 className="font-semibold">Delivery Fees</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Free-delivery threshold also updates the top header line (“Free shipping over …”).
        City fees apply when the order is under that threshold; unknown cities use the default fee.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium">Default Fee (PKR)</label>
          <input
            type="number"
            min={0}
            value={delivery?.defaultFee ?? 250}
            onChange={(e) => onUpdate("delivery", "defaultFee", Number(e.target.value))}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium">Free Delivery Threshold (PKR)</label>
          <input
            type="number"
            min={0}
            value={delivery?.freeThreshold ?? 2500}
            onChange={(e) => onUpdate("delivery", "freeThreshold", Number(e.target.value))}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Shown in the storefront header as free shipping over this amount.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold">City fees (PKR)</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          These cities appear in the checkout dropdown. Customers can also pick &quot;Other city&quot; for the default fee.
        </p>
        <div className="mt-3 overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-surface-low text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-semibold">City</th>
                <th className="px-3 py-2 font-semibold">Fee (PKR)</th>
                <th className="px-3 py-2 w-12" />
              </tr>
            </thead>
            <tbody>
              {rows.map(([city, fee]) => (
                <tr key={city} className="border-t">
                  <td className="px-3 py-2 font-medium">{titleCaseCity(city)}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      value={fee}
                      onChange={(e) => setCityFee(city, e.target.value)}
                      className="w-28 rounded-lg border px-2 py-1.5 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => removeCity(city)}
                      className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${city}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={addCity} className="mt-3 flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-xs font-medium">Add city</label>
            <input
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              placeholder="e.g. Peshawar"
              className="mt-1 w-40 rounded-xl border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">Fee</label>
            <input
              type="number"
              min={0}
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              placeholder="250"
              className="mt-1 w-28 rounded-xl border px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-bold transition hover:bg-surface-low"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>
      </div>
    </section>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    if (saving) return;
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const banner = {
        ...(settings.banner || {}),
        code: normalizePromoCode(settings.banner?.code),
      };
      const promoKey = banner.code;
      const livePromo = promoKey ? settings.promo_codes?.[promoKey] : null;
      const promo_codes = syncPromoToBanner(
        settings.promo_codes,
        banner,
        livePromo?.value,
        livePromo?.active
      );

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delivery: settings.delivery,
          store: settings.store,
          bank: settings.bank,
          jazzcash: settings.jazzcash,
          promo_codes,
          banner,
          site_content: settings.site_content,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setError(data.message || `Failed to save (${res.status})`);
        return;
      }
      setSettings((s) => ({ ...s, banner, promo_codes }));
      invalidateSiteSettingsCache();
      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 5000);
    } catch {
      setError("Network error — could not save settings. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <AdminSettingsSkeleton />;
  }

  const update = (section, field, value) => {
    setSettings((s) => ({ ...s, [section]: { ...s[section], [field]: value } }));
  };

  const banner = settings.banner ?? {
    active: true,
    text: "Limited offer:",
    subtext: "Flat 20% off your order — free shipping over PKR 2,500",
    code: "NOOR20",
  };
  const site_content = settings.site_content ?? {
    heroImage: "",
    indoorImage: "",
    aboutImage: "",
    facebookUrl: "",
    instagramUrl: "",
    copyrightText: "Noor Nursery Pakistan. All rights reserved.",
  };

  const promoCode = normalizePromoCode(banner.code);
  const promo =
    (promoCode && settings.promo_codes?.[promoCode]) ||
    Object.values(settings.promo_codes || {})[0] ||
    { active: true, type: "percent", value: 20 };

  const setBannerCode = (raw) => {
    const nextCode = normalizePromoCode(raw);
    setSettings((s) => {
      const prevCode = normalizePromoCode(s.banner?.code);
      const prevPromo =
        (prevCode && s.promo_codes?.[prevCode]) ||
        Object.values(s.promo_codes || {})[0] ||
        { active: true, type: "percent", value: 20 };

      const nextBanner = { ...s.banner, code: nextCode };
      const nextPromos = nextCode
        ? syncPromoToBanner(s.promo_codes, nextBanner, prevPromo.value, prevPromo.active)
        : s.promo_codes;

      return {
        ...s,
        banner: nextBanner,
        promo_codes: nextPromos,
      };
    });
  };

  const updatePromo = (field, value) => {
    if (!promoCode) return;
    setSettings((s) => ({
      ...s,
      promo_codes: syncPromoToBanner(
        s.promo_codes,
        { ...s.banner, code: promoCode },
        field === "value" ? Number(value) : s.promo_codes?.[promoCode]?.value,
        field === "active" ? value : s.promo_codes?.[promoCode]?.active
      ),
    }));
  };

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-primary">Store Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage delivery fees, store info, banner, images, social links, and promo codes.
      </p>

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
            Controls the gold banner below the top bar. The promo code here is the same code accepted at checkout.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium">Bold Label (e.g. &quot;Limited offer:&quot;)</label>
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
                placeholder="Flat 20% off your order"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Promo Code (leave empty to hide)</label>
              <input
                value={banner.code ?? ""}
                onChange={(e) => setBannerCode(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-mono"
                placeholder="NOOR20"
              />
            </div>
          </div>
          {banner.active && (
            <div className="mt-4 rounded-xl bg-yellow-400 px-4 py-2.5 text-center text-sm text-yellow-900">
              <span className="mr-2">⚡</span>
              <span className="font-bold">{banner.text || "Limited offer:"}</span>
              {" "}{banner.subtext || "Flat 20% off your order"}
              {banner.code && (
                <span className="ml-2 rounded bg-yellow-900 px-2 py-0.5 font-mono text-xs font-bold text-yellow-400">
                  Code: {normalizePromoCode(banner.code)}
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
            Upload images to Cloudinary. Leave empty to keep the default storefront image.
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            {[
              { field: "heroImage", label: "Hero Banner Image" },
              { field: "indoorImage", label: "Indoor Collection Image" },
              { field: "aboutImage", label: "About Us / Brand Story Image" },
            ].map(({ field, label }) => (
              <ImageUpload
                key={field}
                label={label}
                value={site_content[field] ?? ""}
                onChange={(url) => update("site_content", field, url)}
                folder="noor-nursery/site"
                allowUrl={false}
              />
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
                  value={settings.jazzcash?.[f.id] || ""}
                  onChange={(e) => update("jazzcash", f.id, e.target.value)}
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
        <DeliveryFeesSection
          delivery={settings.delivery}
          onUpdate={update}
          onReplaceCityFees={(cityFees) =>
            setSettings((s) => ({
              ...s,
              delivery: { ...s.delivery, cityFees },
            }))
          }
        />

        {/* ── Promo discount (tied to banner code) ── */}
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">
            Promo Discount{promoCode ? ` — ${promoCode}` : ""}
          </h2>
          {!promoCode ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Set a promo code in the Flash Deal Banner above to enable checkout discounts for that code.
            </p>
          ) : (
            <>
              <p className="mt-1 text-xs text-muted-foreground">
                Discount for code <span className="font-mono font-semibold">{promoCode}</span> from the banner. Changing the banner code updates this promo.
              </p>
              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={promo.active ?? true}
                    onChange={(e) => updatePromo("active", e.target.checked)}
                  />
                  Active at checkout
                </label>
                <div>
                  <label className="block text-xs font-medium">Discount (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={promo.value ?? 20}
                    onChange={(e) => updatePromo("value", e.target.value)}
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </>
          )}
        </section>

      </div>

      <div className="mt-8 space-y-3">
        {message && (
          <p
            role="status"
            className="rounded-xl bg-leaf/10 px-4 py-3 text-sm font-medium text-leaf"
          >
            {message}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
          >
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition hover:bg-forest disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving…" : "Save All Settings"}
        </button>
      </div>
    </>
  );
}
