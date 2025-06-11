// app/dashboard/tasks/[id]/page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";

interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: string;
  status: string;
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load on mount
  useEffect(() => {
    fetch(`/api/tasks/${id}`)
      .then((res) => res.json())
      .then((data) => setTask(data))
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (!task) return;
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!task) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setError(payload.error || "Save failed");
      setSaving(false);
      return;
    }

    router.push("/dashboard/tasks");
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    router.push("/dashboard/tasks");
  };

  if (loading) return <p>Loading…</p>;
  if (!task || "error" in task) return <p className="text-red-600">Task not found</p>;

  return (
    <form onSubmit={handleSave} className="max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Edit Task</h1>
      {error && <p className="text-red-600">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Project ID</label>
        <input
          name="projectId"
          type="text"
          value={task.projectId}
          onChange={handleChange}
          disabled={saving}
          className="mt-1 block w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          name="title"
          type="text"
          value={task.title}
          onChange={handleChange}
          disabled={saving}
          className="mt-1 block w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          rows={3}
          value={task.description}
          onChange={handleChange}
          disabled={saving}
          className="mt-1 block w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Assigned To (User ID)</label>
        <input
          name="assignedTo"
          type="text"
          value={task.assignedTo}
          onChange={handleChange}
          disabled={saving}
          className="mt-1 block w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            name="dueDate"
            type="date"
            value={task.dueDate.substring(0, 10)}
            onChange={handleChange}
            disabled={saving}
            className="mt-1 block w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select
            name="priority"
            value={task.priority}
            onChange={handleChange}
            disabled={saving}
            className="mt-1 block w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          >
            {["Low", "Normal", "High", "Urgent"].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          name="status"
          value={task.status}
          onChange={handleChange}
          disabled={saving}
          className="mt-1 block w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
        >
          {["Open", "In Progress", "Completed", "Blocked"].map((opt) => (
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
