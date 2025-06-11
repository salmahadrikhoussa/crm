"use client";
import { useState, FormEvent } from "react";

export interface UserInput { name: string; email: string; role: string; }

interface Props { onSuccess: (u: UserInput & { id: string }) => void; onClose: () => void; }

export default function NewUserForm({ onSuccess, onClose }: Props) {
  const [form, setForm] = useState<UserInput>({ name:"", email:"", role:"admin" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) {
    setForm(f=>({...f,[e.target.name]:e.target.value}));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    const res = await fetch("/api/users",{
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form)
    });
    if(!res.ok) { setError("Failed to create"); setLoading(false); return; }
    const u = await res.json();
    onSuccess(u);
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4 w-full max-w-md">
        <h2 className="text-xl font-semibold">New User</h2>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {["name","email"].map((f)=>(
          <div key={f}>
            <label className="block text-sm font-medium text-gray-700">{f.charAt(0).toUpperCase()+f.slice(1)}</label>
            <input
              name={f} type={f==="email"?"email":"text"} required
              value={(form as any)[f]} onChange={handleChange}
              disabled={loading}
              className="mt-1 block w-full border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            name="role" value={form.role} onChange={handleChange}
            disabled={loading}
            className="mt-1 block w-full border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
          >
            {["admin","bizdev","developer"].map(r=>(
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {loading?"Saving…":"Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
