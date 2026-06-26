import { z } from "zod";

export const CreateBlastSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  accountId: z.string(),
  messageText: z.string().min(1, "Pesan wajib diisi").max(4096),
  scope: z.enum(["all", "activeWa"]).default("activeWa"),
  label: z.string().max(50).optional(),
});

export type CreateBlastInput = z.infer<typeof CreateBlastSchema>;
