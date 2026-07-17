import { z } from "zod";

export const createNotebookSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title is too long"),
});

export const updateNotebookSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  isArchived: z.boolean().optional(),
});
