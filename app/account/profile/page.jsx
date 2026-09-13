"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreLayout } from "@/components/layout/StoreLayout";

const emptyAddress = {
  fullName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  area: "",
  city: "Lahore",
  province: "Punjab",
  postalCode: "",
  isDefault: false,
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProfile = () =>
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) {
          router.push("/login?redirect=/account/profile");
          return;
        }
        setUser(data.user);
        setProfile({ name: data.user.name, phone: data.user.phone || "" });
      });

  useEffect(() => {
    loadProfile();
  }, [router]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.message || "Failed to update profile");
      return;
    }
    setUser(data.user);
    setMessage("Profile updated");
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwords),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.message || "Failed to update password");
      return;
    }
    setPasswords({ currentPassword: "", newPassword: "" });
    setMessage("Password updated");
  };

  const addAddress = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddress),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.message || "Failed to add address");
      return;
    }
    setUser((u) => ({ ...u, addresses: data.addresses }));
    setNewAddress(emptyAddress);
    setMessage("Address saved");
  };

  const removeAddress = async (id) => {
    const res = await fetch(`/api/account/addresses?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setUser((u) => ({ ...u, addresses: data.addresses }));
      setMessage("Address removed");
    }
  };

  if (!user) return null;

  return (
    <StoreLayout showFlashDeal={false}>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link href="/account" className="text-sm text-secondary hover:underline">← Account</Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-primary">Profile</h1>

        {message && <p className="mt-4 rounded-xl bg-leaf/10 px-4 py-3 text-sm text-leaf">{message}</p>}
        {error && <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

        <form onSubmit={saveProfile} className="mt-8 rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Personal Details</h2>
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="mt-1 w-full rounded-xl border px-4 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input value={user.email} disabled className="mt-1 w-full rounded-xl border bg-surface-low px-4 py-2 text-sm text-muted-foreground" />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="mt-1 w-full rounded-xl border px-4 py-2 text-sm"
            />
          </div>
          <button type="submit" className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">
            Save Profile
          </button>
        </form>

        <form onSubmit={savePassword} className="mt-6 rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Change Password</h2>
          <div>
            <label className="block text-sm font-medium">Current Password</label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="mt-1 w-full rounded-xl border px-4 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">New Password</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="mt-1 w-full rounded-xl border px-4 py-2 text-sm"
              minLength={8}
              required
            />
          </div>
          <button type="submit" className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">
            Update Password
          </button>
        </form>

        <div className="mt-6 rounded-2xl border bg-card p-6">
          <h2 className="font-semibold text-foreground">Saved Addresses</h2>
          {user.addresses?.length ? (
            <ul className="mt-4 space-y-3">
              {user.addresses.map((addr) => (
                <li key={addr._id} className="rounded-xl border p-4 text-sm">
                  <p className="font-medium">{addr.fullName}</p>
                  <p className="text-muted-foreground">{addr.addressLine1}, {addr.area}, {addr.city}</p>
                  <p className="text-muted-foreground">{addr.phone}</p>
                  <button
                    type="button"
                    onClick={() => removeAddress(addr._id)}
                    className="mt-2 text-xs font-semibold text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No saved addresses yet.</p>
          )}

          <form onSubmit={addAddress} className="mt-6 space-y-3 border-t pt-6">
            <h3 className="text-sm font-semibold">Add New Address</h3>
            {[
              { id: "fullName", label: "Full Name" },
              { id: "phone", label: "Phone" },
              { id: "addressLine1", label: "Address Line 1" },
              { id: "area", label: "Area" },
              { id: "city", label: "City" },
              { id: "province", label: "Province" },
            ].map((f) => (
              <div key={f.id}>
                <label className="block text-xs font-medium">{f.label}</label>
                <input
                  value={newAddress[f.id]}
                  onChange={(e) => setNewAddress({ ...newAddress, [f.id]: e.target.value })}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                  required
                />
              </div>
            ))}
            <button type="submit" className="rounded-full bg-secondary px-5 py-2 text-sm font-bold text-secondary-foreground">
              Add Address
            </button>
          </form>
        </div>
      </div>
    </StoreLayout>
  );
}
