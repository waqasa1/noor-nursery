"use client";

import { useEffect, useState } from "react";
import { AdminPageHeaderSkeleton, AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { invalidateSiteSettingsCache } from "@/lib/useSiteSettings";
import { Loader2, Pencil, Plus, Trash2, X, Download } from "lucide-react";

const EMPTY_FORM = { q: "", a: "" };

export default function AdminFaqsPage() {
  const [items, setItems] = useState([]);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = () =>
    fetch("/api/admin/faqs")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setItems(d.faqs || []);
          setConfigured(!!d.configured);
        }
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

  const openEdit = (f) => {
    setEditingId(f.id);
    setForm({ q: f.q || "", a: f.a || "" });
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

    try {
      const url = editingId ? `/api/admin/faqs/${editingId}` : "/api/admin/faqs";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to save FAQ");
        return;
      }
      invalidateSiteSettingsCache();
      setMessage(editingId ? "FAQ updated." : "FAQ added.");
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
    if (!confirm("Delete this FAQ?")) return;
    setError("");
    const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      setError(data.message || "Failed to delete");
      return;
    }
    invalidateSiteSettingsCache();
    setItems((list) => list.filter((t) => t.id !== id));
    setConfigured(true);
    setMessage("FAQ deleted.");
    setTimeout(() => setMessage(""), 4000);
  };

  const importDefaults = async () => {
    if (
      items.length > 0 &&
      !confirm("Replace your current FAQ list with the starter questions?")
    ) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importDefaults: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to import defaults");
        return;
      }
      invalidateSiteSettingsCache();
      setItems(data.faqs || []);
      setConfigured(true);
      setMessage("Starter FAQs imported. Edit them anytime.");
      setTimeout(() => setMessage(""), 4000);
    } catch {
      setError("Network error — try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && items.length === 0 && !configured) {
    return (
      <>
        <AdminPageHeaderSkeleton />
        <AdminTableSkeleton columns={3} rows={4} />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">FAQs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Questions shown on the homepage and the FAQ page.
            {!configured
              ? " Until you save FAQs here, the storefront shows built-in starter answers."
              : items.length === 0
                ? " Your list is empty — FAQ sections are hidden on the storefront."
                : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={importDefaults}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold hover:bg-surface-low disabled:opacity-70"
          >
            <Download className="h-4 w-4" />
            Import starter FAQs
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-forest"
          >
            <Plus className="h-4 w-4" />
            Add FAQ
          </button>
        </div>
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
        <form onSubmit={save} className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">{editingId ? "Edit FAQ" : "New FAQ"}</h2>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-surface-low"
              aria-label="Close form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium">Question</label>
              <input
                required
                value={form.q}
                onChange={(e) => setForm((f) => ({ ...f, q: e.target.value }))}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="Is delivery free?"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Answer</label>
              <textarea
                required
                rows={5}
                value={form.a}
                onChange={(e) => setForm((f) => ({ ...f, a: e.target.value }))}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="Yes — free delivery applies when…"
              />
            </div>
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
          {configured
            ? "No FAQs yet. Add one, or import the starter list."
            : "You haven’t customized FAQs yet. The website still shows starter answers. Import them here to edit, or add your own."}
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          {items.map((f, index) => (
            <article key={f.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Q{index + 1}
                  </p>
                  <p className="mt-1 font-semibold text-foreground">{f.q}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(f)}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-surface-low"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(f.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
