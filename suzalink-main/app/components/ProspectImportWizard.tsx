// components/ProspectImportWizard.tsx
"use client";

import { useState, ChangeEvent } from "react";
import Papa from "papaparse";

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
  const [importing, setImporting] = useState(false);

  // Step 1: File selection
  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setStep(2);
      setHeaders([]);
      setMapping({});
      setPreview([]);
      setError(null);
    }
  }

  // Step 2: Extract headers using PapaParse
  async function loadHeaders() {
    if (!file) return;
    setError(null);
    Papa.parse(file, {
      header: true,
      preview: 1,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields && results.meta.fields.length > 0) {
          setHeaders(results.meta.fields);
        } else {
          setError("Aucune colonne détectée dans le CSV.");
        }
      },
      error: (err) => setError("Erreur parsing CSV: " + err.message),
    });
  }

  // Step 3: Generate preview using PapaParse
  async function generatePreview() {
    if (!file) return;
    setError(null);
    Papa.parse(file, {
      header: true,
      preview: 5,
      skipEmptyLines: true,
      complete: (results) => {
        setPreview(results.data as Record<string, string>[]);
      },
      error: (err) => setError("Erreur parsing CSV: " + err.message),
    });
  }

  // Step 4: Confirm import using PapaParse and mapping
  async function confirmImport() {
    if (!file) return;
    setError(null);
    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Mapping des colonnes CSV vers les champs attendus
          const mappedRows = (results.data as Record<string, string>[])
            .map((row) => {
              const obj: Record<string, string> = {};
              headers.forEach((h) => {
                const field = mapping[h];
                if (field) obj[field] = row[h]?.trim() || "";
              });
              return obj;
            })
            .filter(
              (row) =>
                row.name &&
                row.email &&
                row.phone &&
                row.status &&
                row.assignedTo
            ); // filtre les lignes incomplètes

          if (mappedRows.length === 0) {
            setError("Aucune ligne valide à importer.");
            setImporting(false);
            return;
          }

          const res = await fetch("/api/prospects/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mappedRows),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Import failed");
          onImported(json.count);
          onClose();
        } catch (err: any) {
          setError(err.message || "Import error");
        } finally {
          setImporting(false);
        }
      },
      error: (err) => {
        setError("Erreur parsing CSV: " + err.message);
        setImporting(false);
      },
    });
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
            <h2 className="text-xl font-semibold mb-4">Étape 1 : Importer un CSV</h2>
            <input type="file" accept=".csv" onChange={handleFile} />
            <div className="text-xs text-gray-500 mt-2">
              Le fichier doit être au format CSV.<br />
              Colonnes attendues : name, email, phone, status, assignedTo
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Étape 2 : Mapper les colonnes</h2>
            <button
              onClick={loadHeaders}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Charger les colonnes
            </button>
            {headers.length > 0 && (
              <div className="mb-4">
                {headers.map((h) => (
                  <div key={h} className="flex items-center mb-2 space-x-2">
                    <span className="w-32">{h}</span>
                    <select
                      onChange={(e) =>
                        setMapping((m) => ({ ...m, [h]: e.target.value }))
                      }
                      className="border p-1 rounded"
                      value={mapping[h] || ""}
                    >
                      <option value="">-- mapper vers --</option>
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
                  Suivant
                </button>
              </div>
            )}
            {error && <div className="text-red-600">{error}</div>}
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Étape 3 : Prévisualisation
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
              Confirmer
            </button>
            {error && <div className="text-red-600">{error}</div>}
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Étape 4 : Import</h2>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <button
              onClick={confirmImport}
              disabled={importing}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {importing ? "Import en cours..." : "Démarrer l'import"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}