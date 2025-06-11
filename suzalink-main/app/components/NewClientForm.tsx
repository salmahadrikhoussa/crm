// components/NewClientForm.tsx
"use client";

import { useState, FormEvent } from "react";

export interface ClientInput {
  name: string;
  type: string;
  contactInfo: string;
  portalAccess: boolean;
  assignedBizDev: string;
}

interface NewClientFormProps {
  onSuccess: (client: ClientInput & { id: string }) => void;
  onClose: () => void;
}

export default function NewClientForm({ onSuccess, onClose }: NewClientFormProps) {
  const [form, setForm] = useState<ClientInput>({
    name: "",
    type: "",
    contactInfo: "",
    portalAccess: false,
    assignedBizDev: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const { error: msg } = await res.json();
      setError(msg || "Failed to create client");
      setLoading(false);
      return;
    }
    const created = await res.json();
    onSuccess(created);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl space-y-4" onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold">New Client</h2>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            disabled={loading}
            className="mt-1 block w-full border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
          <input
            id="type"
            name="type"
            type="text"
            required
            value={form.type}
            onChange={handleChange}
            disabled={loading}
            className="mt-1 block w-full border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700">Contact Info</label>
          <input
            id="contactInfo"
            name="contactInfo"
            type="text"
            required
            value={form.contactInfo}
            onChange={handleChange}
            disabled={loading}
            className="mt-1 block w-full border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="portalAccess"
            name="portalAccess"
            type="checkbox"
            checked={form.portalAccess}
            onChange={handleChange}
            disabled={loading}
            className="h-4 w-4"
          />
          <label htmlFor="portalAccess" className="text-sm text-gray-700">
            Portal Access
          </label>
        </div>

        <div>
          <label htmlFor="assignedBizDev" className="block text-sm font-medium text-gray-700">Assigned BizDev (User ID)</label>
          <input
            id="assignedBizDev"
            name="assignedBizDev"
            type="text"
            required
            value={form.assignedBizDev}
            onChange={handleChange}
            disabled={loading}
            className="mt-1 block w-full border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
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
