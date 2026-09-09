"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch("/api/admin/customers").then((r) => r.json()).then((d) => setCustomers(d.customers || []));
  }, []);

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-primary">Customers</h1>
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
    </AdminLayout>
  );
}
