import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  email: z.string().email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Minimal 8 karakter")
    .regex(/[A-Z]/, "Minimal 1 huruf besar")
    .regex(/[a-z]/, "Minimal 1 huruf kecil")
    .regex(/[0-9]/, "Minimal 1 angka"),
});

export const LoginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
