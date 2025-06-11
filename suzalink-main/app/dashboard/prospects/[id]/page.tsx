"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";

interface Prospect {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  assignedTo: string;
}

export default function ProspectDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/prospects/${id}`)
      .then((res) => res.json())
      .then((data) => setProspect(data))
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!prospect) return;
    setProspect({ ...prospect, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!prospect) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/prospects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prospect),
    });

    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({}));
      setError(msg || "Save failed");
      setSaving(false);
      return;
    }

    router.push("/dashboard/prospects");
  };

  const handleDelete = async () => {
    if (!confirm("Delete this prospect?")) return;
    await fetch(`/api/prospects/${id}`, { method: "DELETE" });
    router.push("/dashboard/prospects");
  };

  if (loading) return <p>Loading…</p>;
  if (!prospect) return <p className="text-red-600">Not found</p>;

  return (
    <form onSubmit={handleSave} className="max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Edit Prospect</h1>
      {error && <p className="text-red-600">{error}</p>}

      {["name","email","phone"].map((f) => (
        <div key={f}>
          <label className="block text-sm font-medium text-gray-700">
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </label>
          <input
            name={f}
            type={f==="email"?"email":"text"}
            value={(prospect as any)[f]}
            onChange={handleChange}
            disabled={saving}
            className="mt-1 block w-full border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          name="status"
          value={prospect.status}
          onChange={handleChange}
          disabled={saving}
          className="mt-1 block w-full border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
        >
          {["New","Contacted","Qualified","Won","Lost"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Assigned To</label>
        <input
          name="assignedTo"
          type="text"
          value={prospect.assignedTo}
          onChange={handleChange}
          disabled={saving}
          className="mt-1 block w-full border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex space-x-2 pt-4">
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex-1"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
