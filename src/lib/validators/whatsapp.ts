import { z } from "zod";

export const CreateAccountSchema = z.object({
  label: z.string().min(1, "Label wajib diisi").max(50),
});

export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;
