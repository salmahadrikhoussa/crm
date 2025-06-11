// lib/schemas.ts
import { z } from "zod";

// --- Prospects ---
export const ProspectSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  status: z.enum(["New", "Contacted", "Qualified", "Won", "Lost"]),
  assignedTo: z.string().min(1),
});
export type ProspectInput = z.infer<typeof ProspectSchema>;

// --- Clients ---
export const ClientSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  contactInfo: z.string().min(1),
  portalAccess: z.boolean(),
  assignedBizDev: z.string().min(1),
});
export type ClientInput = z.infer<typeof ClientSchema>;

// --- Projects ---
export const ProjectSchema = z.object({
  name: z.string().min(1),
  clientId: z.string().min(1),
  owner: z.string().min(1),
  startDate: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "Invalid date",
  }),
  endDate: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "Invalid date",
  }),
  status: z.enum(["Active", "Completed", "On Hold", "Cancelled"]),
});
export type ProjectInput = z.infer<typeof ProjectSchema>;

// --- Tasks ---
export const TaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().or(z.literal("")),
  assignedTo: z.string().min(1),
  dueDate: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "Invalid date",
  }),
  priority: z.enum(["Low", "Normal", "High", "Urgent"]),
  status: z.enum(["Open", "In Progress", "Completed", "Blocked"]),
});
export type TaskInput = z.infer<typeof TaskSchema>;

// --- Users ---
export const UserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "bizdev", "developer"]),
  avatar: z.string().optional(),
});
export type UserInput = z.infer<typeof UserSchema>;
