// app/dashboard/tasks/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NewTaskForm, { TaskInput } from "../../components/NewTaskForm";
import { useUsers } from "@/hooks/useUsers";

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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // filter/search state
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data: Task[]) => setTasks(data))
      .finally(() => setLoading(false));
  }, []);

  const handleNew = (newTask: TaskInput & { id: string }) => {
    setTasks((prev) => [...prev, newTask]);
    setShowForm(false);
  };

  if (loading) return <p>Loading tasks…</p>;

  // apply search & filters
  const displayed = tasks
    .filter((t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((t) =>
      priorityFilter === "All" ? true : t.priority === priorityFilter
    )
    .filter((t) =>
      statusFilter === "All" ? true : t.status === statusFilter
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowForm(true)}
        >
          New Task
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between mb-4 space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search title…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          >
            {["All", "Low", "Normal", "High", "Urgent"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          >
            {["All", "Open", "In Progress", "Completed", "Blocked"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            setSearchTerm("");
            setPriorityFilter("All");
            setStatusFilter("All");
          }}
          className="text-sm text-gray-600 underline"
        >
          Reset Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              {["Title","Project ID","Assignee","Due Date","Priority","Status","Actions"].map((h) => (
                <th key={h} className="px-4 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">
                  <Link href={`/dashboard/tasks/${t.id}`} className="text-blue-600 hover:underline">
                    {t.title}
                  </Link>
                </td>
                <td className="px-4 py-2">{t.projectId}</td>
                <td className="px-4 py-2">{t.assignedTo}</td>
                <td className="px-4 py-2">{new Date(t.dueDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{t.priority}</td>
                <td className="px-4 py-2">{t.status}</td>
                <td className="px-4 py-2">
                  <Link href={`/dashboard/tasks/${t.id}`} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && <NewTaskForm onSuccess={handleNew} onClose={() => setShowForm(false)} />}
    </div>
  );
}
