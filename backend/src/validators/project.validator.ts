import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(150, "Project name must not exceed 150 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description must not exceed 1000 characters")
    .optional(),
});

export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Project name is required")
      .max(150, "Project name must not exceed 150 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .max(1000, "Description must not exceed 1000 characters")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.description !== undefined,
    {
      message: "At least one field must be provided",
    }
  );