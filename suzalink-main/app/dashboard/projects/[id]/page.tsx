// app/dashboard/projects/[id]/page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";

interface Project {
  id: string;
  name: string;
  clientId: string;
  owner: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // load on mount
  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => setProject(data))
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!project) return;
    const { name, value } = e.target;
    setProject({ ...project, [name]: value });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });

    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({}));
      setError(msg || "Save failed");
      setSaving(false);
      return;
    }

    router.push("/dashboard/projects");
  };

  const handleDelete = async () => {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.push("/dashboard/projects");
  };

  if (loading) return <p>Loading…</p>;
  if (!project) return <p className="text-red-600">Project not found</p>;

  return (
    <form onSubmit={handleSave} className="max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Edit Project</h1>
      {error && <p className="text-red-600">{error}</p>}

      {[
        { label: "Name", name: "name", type: "text" },
        { label: "Client ID", name: "clientId", type: "text" },
        { label: "Owner (User ID)", name: "owner", type: "text" },
      ].map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700">{field.label}</label>
          <input
            name={field.name}
            type={field.type}
            value={(project as any)[field.name]}
            onChange={handleChange}
            disabled={saving}
            className="mt-1 block w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            name="startDate"
            type="date"
            value={project.startDate.substring(0, 10)}
            onChange={handleChange}
            disabled={saving}
            className="mt-1 block w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            name="endDate"
            type="date"
            value={project.endDate.substring(0, 10)}
            onChange={handleChange}
            disabled={saving}
            className="mt-1 block w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          name="status"
          value={project.status}
          onChange={handleChange}
          disabled={saving}
          className="mt-1 block w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
        >
          {["Active", "Completed", "On Hold", "Cancelled"].map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
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
