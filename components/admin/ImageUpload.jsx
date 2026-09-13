"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

export function ImageUpload({
  label = "Image",
  value = "",
  onChange,
  folder = "noor-nursery/products",
  required = false,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [configured, setConfigured] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/upload")
      .then((r) => r.json())
      .then((d) => setConfigured(!!d.configured))
      .catch(() => setConfigured(false));
  }, []);

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Upload failed");
        return;
      }
      onChange?.(data.url);
    } catch {
      setError("Upload failed. Try again or paste a URL.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <div className="mt-2 flex flex-wrap items-start gap-4">
        {value ? (
          <img
            src={value}
            alt=""
            className="h-24 w-24 rounded-xl border object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-xl border bg-surface-low text-muted-foreground">
            <ImagePlus className="h-8 w-8" />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          {configured && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-bold file:text-primary-foreground"
                disabled={uploading}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {uploading && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
                </p>
              )}
            </>
          )}
          {!configured && (
            <p className="text-xs text-muted-foreground">
              Cloudinary not configured — paste an image URL below.
            </p>
          )}
          <input
            type="url"
            value={value}
            required={required}
            placeholder="https://…"
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}
