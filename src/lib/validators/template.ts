import { z } from "zod";

export const CreateTemplateSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  body: z.string().min(1, "Isi pesan wajib diisi").max(4096),
});

export type CreateTemplateInput = z.infer<typeof CreateTemplateSchema>;
