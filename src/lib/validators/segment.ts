import { z } from "zod";

export const CreateSegmentSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  filter: z.record(z.unknown()).default({}),
});

export type CreateSegmentInput = z.infer<typeof CreateSegmentSchema>;
