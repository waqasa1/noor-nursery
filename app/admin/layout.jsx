import { AdminLayout } from "@/components/layout/AdminLayout";

/**
 * Persistent admin chrome (sidebar). Survives client navigations so
 * loading.js only replaces page content — not the sidebar.
 */
export default function AdminRootLayout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
