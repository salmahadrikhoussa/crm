// components/NewProjectForm.tsx
"use client";

import { useState, FormEvent } from "react";

export interface ProjectInput {
  name: string;
  clientId: string;
  owner: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface NewProjectFormProps {
  onSuccess: (proj: ProjectInput & { id: string }) => void;
  onClose: () => void;
}

export default function NewProjectForm({ onSuccess, onClose }: NewProjectFormProps) {
  const [form, setForm] = useState<ProjectInput>({
    name: "",
    clientId: "",
    owner: "",
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date().toISOString().substring(0, 10),
    status: "Active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({}));
        setError(msg || "Failed to create project");
      } else {
        const created = await res.json();
        onSuccess(created);
        // now that we've succeeded, reset loading and close
        setLoading(false);
        onClose();
        return;
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      // ensure we turn off loading if we fell into the error path
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl space-y-4"
      >
        <h2 className="text-xl font-semibold">New Project</h2>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {[
          { label: "Project Name", name: "name", type: "text" },
          { label: "Client ID",     name: "clientId", type: "text" },
          { label: "Owner (User ID)",name: "owner", type: "text" },
        ].map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              required
              value={(form as any)[field.name]}
              onChange={handleChange}
              disabled={loading}
              className="mt-1 block w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              disabled={loading}
              className="mt-1 block w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              disabled={loading}
              className="mt-1 block w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            disabled={loading}
            className="mt-1 block w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          >
            {["Active", "Completed", "On Hold", "Cancelled"].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={() => { setLoading(false); onClose(); }}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
