// app/dashboard/projects/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NewProjectForm, { ProjectInput } from "../../components/NewProjectForm";

interface Project {
  id: string;
  name: string;
  clientId: string;
  owner: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data: Project[]) => setProjects(data))
      .finally(() => setLoading(false));
  }, []);

  const handleNew = (newProj: ProjectInput & { id: string }) => {
    setProjects((prev) => [...prev, newProj]);
    setShowForm(false);
  };

  if (loading) return <p>Loading projects…</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowForm(true)}
        >
          New Project
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              {["Name", "Client ID", "Owner", "Start Date", "End Date", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">
                  {/* Option A: Make the name itself clickable */}
                  <Link
                    href={`/dashboard/projects/${p.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-2">{p.clientId}</td>
                <td className="px-4 py-2">{p.owner}</td>
                <td className="px-4 py-2">{new Date(p.startDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{new Date(p.endDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{p.status}</td>
                <td className="px-4 py-2">
                  {/* Option B: Explicit Details button */}
                  <Link
                    href={`/dashboard/projects/${p.id}`}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <NewProjectForm
          onSuccess={handleNew}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
