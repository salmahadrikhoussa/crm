// app/dashboard/ClientLayout.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Clients",  href: "/dashboard/clients" },
  { label: "Prospects",href: "/dashboard/prospects" },
  { label: "Projects", href: "/dashboard/projects" },
  { label: "Tasks",    href: "/dashboard/tasks" },
  { label: "Users",    href: "/dashboard/users" },
  { label: "Profile",  href: "/dashboard/profile" },  // ← added here
];

interface User {
  id: string;
  name?: string;
  email: string;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  // Fetch current user
  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then((u: User) => setUser(u))
      .catch(() => setUser(null));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (badgeRef.current && !badgeRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  // Derive badge initial
  const rawInitial =
    user?.name?.trim().charAt(0) ||
    user?.email?.trim().charAt(0) ||
    "U";
  const initial = rawInitial.toUpperCase();

  function handleLogout() {
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      router.push("/login");
    });
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <div className="mb-8">
            <img src="/logo.png" alt="Suzalink" className="h-8" />
          </div>
          <nav className="space-y-2">
            {navItems.map(item => {
              const isActive = path === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2 rounded-lg font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Badge */}
        <div ref={badgeRef} className="relative mt-8">
          <button
            onClick={() => setProfileOpen(o => !o)}
            className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
          >
            <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
              {initial}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">
                {user?.name || user?.email || "User"}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute left-0 bottom-full mb-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
              <button
                onClick={() => router.push("/dashboard/profile")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="bg-white rounded-2xl p-6 shadow">{children}</div>
      </main>
    </div>
  );
}
