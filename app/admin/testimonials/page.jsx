"use client";

import { useEffect, useState } from "react";
import { AdminPageHeaderSkeleton, AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { invalidateSiteSettingsCache } from "@/lib/useSiteSettings";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

const EMPTY_FORM = {
  name: "",
  initials: "",
  location: "",
  when: "",
  quote: "",
  rtl: false,
};

function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = () =>
    fetch("/api/admin/testimonials")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setItems(d.testimonials || []);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
    setError("");
  };

  const openEdit = (t) => {
    setEditingId(t.id);
    setForm({
      name: t.name || "",
      initials: t.initials || "",
      location: t.location || "",
      when: t.when || "",
      quote: t.quote || "",
      rtl: !!t.rtl,
    });
    setFormOpen(true);
    setError("");
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      ...form,
      initials: (form.initials || initialsFromName(form.name)).slice(0, 4),
    };

    try {
      const url = editingId
        ? `/api/admin/testimonials/${editingId}`
        : "/api/admin/testimonials";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to save testimonial");
        return;
      }
      invalidateSiteSettingsCache();
      setMessage(editingId ? "Testimonial updated." : "Testimonial added.");
      setTimeout(() => setMessage(""), 4000);
      closeForm();
      setLoading(true);
      await load();
    } catch {
      setError("Network error — try again.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this testimonial?")) return;
    setError("");
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      setError(data.message || "Failed to delete");
      return;
    }
    invalidateSiteSettingsCache();
    setItems((list) => list.filter((t) => t.id !== id));
    setMessage("Testimonial deleted.");
    setTimeout(() => setMessage(""), 4000);
  };

  if (loading && items.length === 0) {
    return (
      <>
        <AdminPageHeaderSkeleton />
        <AdminTableSkeleton columns={4} rows={4} />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Testimonials</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reviews shown on the homepage. If none are added, the section is hidden.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-forest"
        >
          <Plus className="h-4 w-4" />
          Add testimonial
        </button>
      </div>

      {message && (
        <p role="status" className="mt-4 rounded-xl bg-leaf/10 px-4 py-3 text-sm font-medium text-leaf">
          {message}
        </p>
      )}
      {error && !formOpen && (
        <p role="alert" className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      {formOpen && (
        <form
          onSubmit={save}
          className="mt-6 rounded-2xl border bg-card p-5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">
              {editingId ? "Edit testimonial" : "New testimonial"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-surface-low"
              aria-label="Close form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({
                    ...f,
                    name,
                    initials: initialsFromName(name),
                  }));
                }}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="Ayesha Khan"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Initials (avatar)</label>
              <input
                required
                maxLength={4}
                value={form.initials}
                onChange={(e) =>
                  setForm((f) => ({ ...f, initials: e.target.value.toUpperCase() }))
                }
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-mono uppercase"
                placeholder="AK"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Location / badge</label>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="DHA Phase 6, Karachi • Verified Buyer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">When (optional)</label>
              <input
                value={form.when}
                onChange={(e) => setForm((f) => ({ ...f, when: e.target.value }))}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="1 week ago"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium">Quote</label>
              <textarea
                required
                rows={4}
                value={form.quote}
                onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="Ordered plants for my apartment…"
              />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={form.rtl}
                onChange={(e) => setForm((f) => ({ ...f, rtl: e.target.checked }))}
              />
              Urdu / RTL quote
            </label>
          </div>

          {error && formOpen && (
            <p role="alert" className="mt-3 text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-forest disabled:opacity-70"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : editingId ? "Update" : "Add"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-surface-low"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          No testimonials yet. The homepage reviews section is hidden until you add one.
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          {items.map((t) => (
            <article
              key={t.id}
              className="rounded-2xl border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                    {t.initials}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[t.location, t.when].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-surface-low"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(t.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
              <p
                className={`mt-3 text-sm leading-relaxed text-muted-foreground ${t.rtl ? "text-urdu" : ""}`}
                dir={t.rtl ? "rtl" : "ltr"}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
