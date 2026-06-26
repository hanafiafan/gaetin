import { z } from "zod";

export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(100),
  contactId: z.string(),
  dueDate: z.string().datetime(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  description: z.string().max(500).optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
