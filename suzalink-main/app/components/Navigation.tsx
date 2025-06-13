"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navigation() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Récupère le rôle depuis le localStorage ou une API
    const userRole = localStorage.getItem("userRole"); // Remplace par ta méthode
    setRole(userRole);
  }, []);

  const links = [
    { href: "/dashboard", label: "Dashboard", roles: ["admin", "bizdev", "developer"] },
    { href: "/dashboard/clients", label: "Clients", roles: ["admin", "bizdev"] },
    { href: "/dashboard/prospects", label: "Prospects", roles: ["admin", "bizdev", "developer"] },
    { href: "/dashboard/tasks", label: "Tasks", roles: ["admin", "bizdev", "developer"] },
    { href: "/dashboard/projects", label: "Projects", roles: ["admin", "bizdev", "developer"] },
    { href: "/dashboard/users", label: "Users", roles: ["admin"] },
  ];

  if (!role) {
    return null; // Ou un message d'attente
  }

  return (
    <nav>
      <ul>
        {links
          .filter((link) => link.roles.includes(role))
          .map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
      </ul>
    </nav>
  );
}