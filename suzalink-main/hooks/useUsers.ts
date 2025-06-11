// hooks/useUsers.ts
import { useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data: User[]) => setUsers(data))
      .catch(console.error);
  }, []);

  // build a lookup map from id → name
  const byId = users.reduce<Record<string, string>>((acc, u) => {
    acc[u.id] = u.name;
    return acc;
  }, {});

  return { users, byId };
}
