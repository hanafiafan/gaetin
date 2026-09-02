import { z } from "zod";

export const CreateEmailBlastSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  subject: z.string().min(1, "Subjek wajib diisi").max(200),
  bodyText: z.string().min(1, "Isi email wajib diisi").max(20000),
  label: z.string().max(50).optional(),
});

export type CreateEmailBlastInput = z.infer<typeof CreateEmailBlastSchema>;
