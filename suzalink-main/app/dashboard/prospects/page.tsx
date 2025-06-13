"use client";

import { useEffect, useState } from "react";
import NewProspectForm, { ProspectInput } from "../../components/NewProspectForm";
import ProspectImportWizard from "../../components/ProspectImportWizard";
import Link from "next/link";

interface Prospect {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  assignedTo: string;
}

export default function ProspectsPage() {
  console.log("ProspectsPage is rendering");

  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // track selected IDs
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allIdsOnPage = (prospects || [])
    .filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((p) => statusFilter === "All" ? true : p.status === statusFilter)
    .slice((page - 1) * perPage, page * perPage)
    .map((p) => p.id);

  useEffect(() => {
    fetch("/api/prospects")
      .then((res) => res.json())
      .then((data: Prospect[]) => {
        if (Array.isArray(data)) {
          setProspects(data);
        } else {
          setProspects([]);
        }
      })
      .catch(() => setProspects([]))
      .finally(() => setLoading(false));
  }, []);

  const handleNew = (newItem: ProspectInput & { id: string }) => {
    setProspects((prev) => [...(prev || []), newItem]);
    setShowForm(false);
  };

  const handleImported = (count: number) => {
    fetch("/api/prospects")
      .then((res) => res.json())
      .then((data: Prospect[]) => {
        if (Array.isArray(data)) {
          setProspects(data);
        } else {
          setProspects([]);
        }
      });
    setShowWizard(false);
  };

  if (loading) return <p>Loading prospects…</p>;

  // filtering
  const filtered = (prospects || [])
    .filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((p) => (statusFilter === "All" ? true : p.status === statusFilter));

  // pagination
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  function toggleSelect(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((s) => {
      const next = new Set(s);
      const allOnPage = allIdsOnPage;
      const allSelected = allOnPage.every((id) => next.has(id));
      if (allSelected) {
        allOnPage.forEach((id) => next.delete(id));
      } else {
        allOnPage.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  async function deleteSelected() {
    if (!confirm(`Delete ${selected.size} selected prospect(s)?`)) return;
    await Promise.all(
      Array.from(selected).map((id) =>
        fetch(`/api/prospects/${id}`, { method: "DELETE" })
      )
    );
    setProspects((prev) => (prev || []).filter((p) => !selected.has(p.id)));
    setSelected(new Set());
  }

  // AJOUT DU LOG ICI
  console.log({ prospects, loading, filtered, paged });

  return (
    <div>
      {/* Header & Actions */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Prospects</h1>
        <div className="space-x-2">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => setShowForm(true)}
          >
            New Prospect
          </button>
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            onClick={() => setShowWizard(true)}
          >
            Import CSV
          </button>
          {selected.size > 0 && (
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={deleteSelected}
            >
              Delete Selected ({selected.size})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between mb-4 space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded p-2 focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded p-2 focus:ring-2 focus:ring-blue-500"
          >
            {["All", "New", "Contacted", "Qualified", "Won", "Lost"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("All");
          }}
          className="text-sm text-gray-600 underline"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={allIdsOnPage.length > 0 && allIdsOnPage.every((id) => selected.has(id))}
                  onChange={toggleSelectAll}
                />
              </th>
              {["Name", "Email", "Phone", "Status", "Assigned To", "Actions"].map((h) => (
                <th key={h} className="px-4 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  Aucun prospect trouvé.
                </td>
              </tr>
            ) : (
              paged.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </td>
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.email}</td>
                  <td className="px-4 py-2">{p.phone}</td>
                  <td className="px-4 py-2">{p.status}</td>
                  <td className="px-4 py-2">{p.assignedTo}</td>
                  <td className="px-4 py-2">
                    <Link href={`/dashboard/prospects/${p.id}`} className="text-blue-600 hover:underline">
                      Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {page} of {pages}</span>
        <button
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          disabled={page === pages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Modals */}
      {showForm && (
        <NewProspectForm onSuccess={handleNew} onClose={() => setShowForm(false)} />
      )}
      {showWizard && (
        <ProspectImportWizard onClose={() => setShowWizard(false)} onImported={handleImported} />
      )}
    </div>
  );
}