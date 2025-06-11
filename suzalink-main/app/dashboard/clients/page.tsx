"use client";

import { useEffect, useState } from "react";
import NewClientForm, { ClientInput } from "../../components/NewClientForm";


interface Client {
  id: string;
  name: string;
  type: string;
  contactInfo: string;
  portalAccess: boolean;
  assignedBizDev: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);



  // filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [accessFilter, setAccessFilter] = useState("All");

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data: Client[]) => setClients(data))
      .finally(() => setLoading(false));
  }, []);

  const handleNew = (newClient: ClientInput & { id: string }) => {
    setClients((prev) => [...prev, newClient]);
    setShowForm(false);
  };

  if (loading) return <p>Loading clients…</p>;

  // derive unique types for the filter dropdown
  const types = Array.from(new Set(clients.map((c) => c.type)));

  // apply filters
  const displayed = clients
    .filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((c) =>
      typeFilter === "All" ? true : c.type === typeFilter
    )
    .filter((c) =>
      accessFilter === "All"
        ? true
        : accessFilter === "Enabled"
        ? c.portalAccess
        : !c.portalAccess
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clients</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowForm(true)}
        >
          New Client
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between mb-4 space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search by name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Access</option>
            <option value="Enabled">Enabled</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>
        <button
          onClick={() => {
            setSearchTerm("");
            setTypeFilter("All");
            setAccessFilter("All");
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
              {["Name", "Type", "Contact Info", "Portal Access", "Assigned BizDev"].map((h) => (
                <th key={h} className="px-4 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2">{c.type}</td>
                <td className="px-4 py-2">{c.contactInfo}</td>
                <td className="px-4 py-2">{c.portalAccess ? "Enabled" : "Disabled"}</td>
                <td className="px-4 py-2">{c.assignedBizDev}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && <NewClientForm onSuccess={handleNew} onClose={() => setShowForm(false)} />}
    </div>
  );
}
