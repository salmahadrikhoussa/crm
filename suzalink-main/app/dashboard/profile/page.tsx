// app/dashboard/profile/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";

interface Me {
  id: string;
}

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  avatar?: string; // base64 data URL
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        // 1) fetch current user ID
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) throw new Error("Not authenticated");
        const me: Me = await meRes.json();

        // 2) fetch full profile
        const profRes = await fetch(`/api/users/${me.id}`);
        if (!profRes.ok) throw new Error("Profile not found");
        const prof: User = await profRes.json();

        setUser(prof);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user) return;
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  }

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUser((u) => (u ? { ...u, avatar: reader.result as string } : u));
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);

    const updates: Partial<User> = {
      name: user.name,
      avatar: user.avatar,
    };

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Save failed");
      }
      // optionally refetch or notify success
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading profile…</p>;
  if (error)   return <p className="text-red-600">{error}</p>;
  if (!user)  return <p className="text-red-600">Profile not found</p>;

  // derive initial
  const rawInitial =
    user.name?.trim().charAt(0) ||
    user.email.trim().charAt(0) ||
    "U";
  const initial = rawInitial.toUpperCase();

  return (
    <form
      onSubmit={handleSave}
      className="max-w-md mx-auto space-y-6 p-6 bg-white rounded-lg shadow"
    >
      <h1 className="text-2xl font-bold">Edit Profile</h1>

      {error && <p className="text-red-600">{error}</p>}

      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-500">
              {initial}
            </div>
          )}
        </div>
        <label className="cursor-pointer text-sm text-blue-600 hover:underline">
          Change Avatar
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatar}
            className="hidden"
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          name="name"
          type="text"
          value={user.name || ""}
          onChange={handleChange}
          disabled={saving}
          required
          className="mt-1 block w-full border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          name="email"
          type="email"
          value={user.email}
          disabled
          className="mt-1 block w-full border-gray-200 bg-gray-100 rounded p-2 cursor-not-allowed"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Profile"}
      </button>
    </form>
  );
}
