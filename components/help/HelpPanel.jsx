"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { HELP_FAQ } from "@/config/help-faq";

export function HelpPanel() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [typing, setTyping] = useState(false);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  const activeFaq = HELP_FAQ.find((f) => f.id === activeId);

  const close = useCallback(() => {
    setOpen(false);
    setActiveId(null);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, close]);

  const selectQuestion = (id) => {
    setActiveId(id);
    setTyping(true);
    setTimeout(() => setTyping(false), 600);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open help and frequently asked questions"
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-2xl transition hover:bg-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <HelpCircle className="h-7 w-7" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-end sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-panel-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-foreground/30"
            aria-label="Close help panel"
            onClick={close}
          />
          <div
            ref={panelRef}
            className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl motion-reduce:transition-none"
          >
            <header className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
              <div>
                <h2 id="help-panel-title" className="font-display text-base font-bold">
                  How can we help?
                </h2>
                <p className="text-urdu text-sm text-primary-foreground/80" dir="rtl" lang="ur">
                  ہم آپ کی کیسے مدد کر سکتے ہیں؟
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close help panel"
                className="rounded-full p-2 hover:bg-forest"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
              {!activeFaq ? (
                <ul className="space-y-2" role="list">
                  {HELP_FAQ.map((faq) => (
                    <li key={faq.id}>
                      <button
                        type="button"
                        onClick={() => selectQuestion(faq.id)}
                        className="w-full rounded-xl border bg-surface-low px-4 py-3 text-left transition hover:border-secondary hover:bg-surface-mid focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        <span className="block text-sm font-semibold text-foreground">
                          {faq.questionEn}
                        </span>
                        <span
                          className="text-urdu mt-1 block text-sm text-secondary"
                          dir="rtl"
                          lang="ur"
                        >
                          {faq.questionUr}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div aria-live="polite">
                  <button
                    type="button"
                    onClick={() => setActiveId(null)}
                    className="mb-3 text-sm font-medium text-secondary hover:underline"
                  >
                    ← Back to questions
                  </button>
                  <div className="rounded-xl bg-surface-low p-4">
                    <p className="text-sm font-semibold text-foreground">{activeFaq.questionEn}</p>
                    <p className="text-urdu text-sm text-secondary" dir="rtl" lang="ur">
                      {activeFaq.questionUr}
                    </p>
                    <div className="mt-3 border-t pt-3">
                      {typing ? (
                        <p className="text-sm text-muted-foreground">...</p>
                      ) : (
                        <>
                          <p className="text-sm leading-relaxed text-foreground">
                            {activeFaq.answerEn}
                          </p>
                          <p
                            className="text-urdu mt-2 text-sm leading-relaxed text-muted-foreground"
                            dir="rtl"
                            lang="ur"
                          >
                            {activeFaq.answerUr}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <footer className="border-t px-4 py-3 text-center text-xs text-muted-foreground">
              Preset answers — not live chat.{" "}
              <a href="/contact" className="font-medium text-secondary hover:underline">
                Contact us
              </a>{" "}
              for direct support.
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
