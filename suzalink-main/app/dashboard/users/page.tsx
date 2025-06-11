"use client";
import { useEffect, useState } from "react";
import NewUserForm, { UserInput } from "../../components/NewUserForm";

interface User { id:string; name:string; email:string; role:string; }

export default function UsersPage() {
  const [users,setUsers]=useState<User[]>([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);

  useEffect(()=>{
    fetch("/api/users").then(r=>r.json()).then(setUsers).finally(()=>setLoading(false));
  },[]);

  function handleNew(u:UserInput&{id:string}) {
    setUsers(prev=>[...prev,u]);
    setShowForm(false);
  }

  if(loading) return <p>Loading users…</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={()=>setShowForm(true)}>
          New User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-100 text-left">
            <tr>
              {["Name","Email","Role"].map(h=>(
                <th key={h} className="px-4 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && <NewUserForm onSuccess={handleNew} onClose={()=>setShowForm(false)}/>}
    </div>
  );
}
