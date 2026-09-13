import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-secondary">404</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-primary">Page not found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground"
      >
        Back to Home
      </Link>
    </div>
  );
}
