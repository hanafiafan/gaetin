import { z } from "zod";

export const CreateContactSchema = z.object({
  name: z.string().max(100).optional(),
  phone: z.string().min(6, "Nomor terlalu pendek").max(20),
  label: z.string().max(50).optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  city: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
});

export const UpdateContactSchema = CreateContactSchema.partial();

export const BulkActionSchema = z.object({
  ids: z.array(z.string()).min(1).max(1000),
  action: z.enum(["delete", "tag"]),
  label: z.string().max(50).optional(),
});

export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>;
export type BulkActionInput = z.infer<typeof BulkActionSchema>;
