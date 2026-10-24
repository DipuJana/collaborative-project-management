import { z } from "zod";

const taskStatuses = ["TODO", "IN_PROGRESS", "DONE"] as const;
const taskPriorities = ["LOW", "MEDIUM", "HIGH"] as const;

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(200),
  description: z.string().trim().max(5000).nullable().optional(),
  status: z.enum(taskStatuses).optional(),
  priority: z.enum(taskPriorities).optional(),
  assignedTo: z.string().regex(/^[1-9]\d*$/).nullable().optional(),
  dueDate: z.iso.date().nullable().optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    status: z.enum(taskStatuses).optional(),
    priority: z.enum(taskPriorities).optional(),
    assignedTo: z.string().regex(/^[1-9]\d*$/).nullable().optional(),
    dueDate: z.iso.date().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
