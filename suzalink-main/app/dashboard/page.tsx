// File: app/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import Navigation from "@/app/components/Navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          window.location.href = "/login";
          return;
        }
        const userData: User = await res.json();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>Not authenticated.</p>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      {/* Rest of your dashboard content */}
    </div>
  );
};

export default Dashboard;