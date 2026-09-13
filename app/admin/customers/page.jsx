"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminPageHeaderSkeleton, AdminTableSkeleton } from "@/components/admin/AdminSkeleton";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      {loading ? (
        <>
          <AdminPageHeaderSkeleton />
          <AdminTableSkeleton columns={4} rows={8} />
        </>
      ) : (
        <>
          <h1 className="font-display text-2xl font-bold text-primary">Customers</h1>
          {customers.length === 0 ? (
            <p className="mt-8 text-center text-muted-foreground">No customers yet.</p>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-surface-low text-left">
                    <th className="p-3">Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c._id} className="border-b">
                      <td className="p-3">{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.phone || "—"}</td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
