import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getSession } from "@/lib/auth/session";

/**
 * Persistent admin chrome (sidebar). Survives client navigations so
 * loading.js only replaces page content — not the sidebar.
 * Also re-checks sessionVersion so password changes kick stale sessions.
 */
export default async function AdminRootLayout({ children }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login?redirect=/admin");
  }

  return <AdminLayout>{children}</AdminLayout>;
}
