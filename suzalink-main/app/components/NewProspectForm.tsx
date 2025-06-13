"use client";

import { useState, FormEvent, ChangeEvent } from "react";

export interface ProspectInput {
  name: string;
  email: string;
  phone: string;
  status: string;
  assignedTo: string;
}

interface NewProspectFormProps {
  onSuccess: (newProspect: ProspectInput & { id: string }) => void;
  onClose: () => void;
}

export default function NewProspectForm({ onSuccess, onClose }: NewProspectFormProps) {
  const [form, setForm] = useState<ProspectInput>({
    name: "",
    email: "",
    phone: "",
    status: "New",
    assignedTo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          setError(errorData.error || "Failed to create prospect");
        } else {
          setError(`HTTP Error: ${res.status} ${res.statusText}`);
        }
        setLoading(false);
        return;
      }

      const responseText = await res.text();
      let created;
      if (responseText) {
        try {
          created = JSON.parse(responseText);
        } catch (parseError) {
          setError("Invalid response from server");
          setLoading(false);
          return;
        }
      } else {
        created = { ...form, id: Date.now().toString() };
      }

      onSuccess(created);
      onClose();
    } catch (networkError) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4">
        <h2 className="text-xl font-semibold">New Prospect</h2>
        {error && <p className="text-sm text-red-600">{error}</p>}

        {[
          { label: "Name", name: "name", type: "text" },
          { label: "Email", name: "email", type: "email" },
          { label: "Phone", name: "phone", type: "tel" },
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              id={name}
              name={name}
              type={type}
              required
              value={form[name as keyof ProspectInput]}
              onChange={handleChange}
              disabled={loading}
              className="mt-1 block w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

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
            {["New", "Contacted", "Qualified", "Won", "Lost"].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Assigned To (User ID)</label>
          <input
            id="assignedTo"
            name="assignedTo"
            type="text"
            required
            value={form.assignedTo}
            onChange={handleChange}
            disabled={loading}
            className="mt-1 block w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}