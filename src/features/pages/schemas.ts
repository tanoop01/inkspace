import { z } from "zod";

const jsonSchema: z.ZodType = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonSchema),
    z.record(jsonSchema),
  ])
);

export const createPageSchema = z.object({
  title: z.string().trim().min(1).max(150).default("Untitled"),
});

export const updatePageSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
  canvasJson: jsonSchema.optional(),
  thumbnailUrl: z.string().optional(),
});

export const reorderPagesSchema = z.object({
  pages: z.array(
    z.object({
      id: z.string(),
      order: z.number().int(),
    })
  ),
});