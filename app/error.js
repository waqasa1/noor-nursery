"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="font-display text-3xl font-bold text-primary">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        We hit an unexpected error. Please try again or return to the shop.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          Try Again
        </button>
        <Link href="/" className="rounded-full border px-6 py-3 text-sm font-bold text-foreground">
          Go Home
        </Link>
      </div>
    </div>
  );
}
