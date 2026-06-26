import { z } from "zod";

// Fase ini fokus pada trigger "X hari tanpa balasan".
// STAGE_CHANGE & SPECIFIC_DATE didefinisikan di schema untuk pengembangan berikutnya.
export const CreateRuleSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  accountId: z.string(),
  days: z.number().int().min(1).max(90),
  messageTemplate: z.string().min(1, "Pesan wajib diisi").max(4096),
});

export type CreateRuleInput = z.infer<typeof CreateRuleSchema>;
