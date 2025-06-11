"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const payload = await res.json();
        setError(payload.error || "Login failed");
        setLoading(false);
        return;
      }

      // On success, redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-600">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="mt-1 block w-full border border-gray-200 rounded-lg p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="you@company.com"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-600">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="mt-1 block w-full border border-gray-200 rounded-lg p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Logging in…" : "Login"}
      </button>

      <div className="text-center">
        <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
          Forgot your password?
        </a>
      </div>
    </form>
  );
}
