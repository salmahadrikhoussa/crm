// lib/permissions.ts

export type Role = "admin" | "bizdev" | "developer";

export function canViewPage(role: Role, page: string): boolean {
  if (role === "admin") return true;
  if (role === "bizdev") {
    return ["clients", "prospects", "tasks", "projects"].includes(page);
  }
  if (role === "developer") {
    return ["tasks", "projects"].includes(page);
  }
  return false;
}

export function canEdit(role: Role, resource: string): boolean {
  if (role === "admin") return true;
  // bizdev et developer ne peuvent rien modifier
  return false;
}