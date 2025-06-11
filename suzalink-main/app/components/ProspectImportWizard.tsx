// components/ProspectImportWizard.tsx
"use client";

import { useState, ChangeEvent } from "react";

interface Props {
  onClose: () => void;
  onImported: (count: number) => void;
}

export default function ProspectImportWizard({ onClose, onImported }: Props) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Step 1: File selection
  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setStep(2);
    }
  }

  // Step 2: Extract headers
  async function loadHeaders() {
    if (!file) return;
    const text = await file.text();
    const [hdrLine] = text.split("\n");
    setHeaders(hdrLine.split(",").map((h) => h.trim()));
  }

  // Step 3: Generate preview
  async function generatePreview() {
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").slice(1, 6); // first 5 rows
    const rows = lines.map((line) => {
      const values = line.split(",");
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = values[i]?.trim() || "";
      });
      return obj;
    });
    setPreview(rows);
  }

  // Step 4: Confirm import
  async function confirmImport() {
    try {
      // Build array of mapped rows
      const text = await file!.text();
      const dataLines = text.split("\n").slice(1).filter(Boolean);
      const rows = dataLines.map((line) => {
        const values = line.split(",");
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          const field = mapping[h];
          if (field) obj[field] = values[i]?.trim() || "";
        });
        return obj;
      });

      const res = await fetch("/api/prospects/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");
      onImported(json.count);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Import error");
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl p-6 rounded-xl shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={onClose}
        >
          ✕
        </button>
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Step 1: Upload CSV</h2>
            <input type="file" accept=".csv" onChange={handleFile} />
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Step 2: Map Columns</h2>
            <button
              onClick={loadHeaders}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Load Columns
            </button>
            {headers.map((h) => (
              <div key={h} className="flex items-center mb-2 space-x-2">
                <span className="w-32">{h}</span>
                <select
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [h]: e.target.value }))
                  }
                  className="border p-1 rounded"
                >
                  <option value="">-- map to --</option>
                  {["name", "email", "phone", "status", "assignedTo"].map(
                    (f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    )
                  )}
                </select>
              </div>
            ))}
            <button
              onClick={() => {
                generatePreview();
                setStep(3);
              }}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
            >
              Next
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Step 3: Preview & Validate
            </h2>
            <div className="overflow-x-auto max-h-48 mb-4">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    {Object.keys(preview[0] || {}).map((h) => (
                      <th key={h} className="px-2 py-1">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t">
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="px-2 py-1">
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setStep(4)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Confirm
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Step 4: Import</h2>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <button
              onClick={confirmImport}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Start Import
            </button>
          </>
        )}
      </div>
    </div>
  );
}
