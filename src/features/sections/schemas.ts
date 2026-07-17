import { z } from "zod";

export const createSectionSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title is too long"),
});

export const updateSectionSchema = z.object({
  title: z.string().trim().min(1).max(100),
});

export const reorderSectionsSchema = z.object({
  sections: z.array(z.object({ id: z.string(), order: z.number().int() })),
});
