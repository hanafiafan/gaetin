import { z } from "zod";
import { UMUR_NOMOR } from "@/lib/messaging/account-age";

export const CreateAccountSchema = z.object({
  label: z.string().min(1, "Label wajib diisi").max(50),
  accountAge: z.enum(UMUR_NOMOR).default("BARU"),
});

/**
 * Semua kolom opsional: formulirnya boleh mengirim hanya yang diubah.
 *
 * Batas atas 1.000 bukan angka aman — itu angka yang mustahil dilampaui tanpa
 * salah ketik. Batas amannya jauh lebih rendah dan disarankan per umur nomor;
 * tapi ini setelan pemiliknya, jadi yang dijaga di sini cuma kewarasannya.
 */
export const UpdateAccountSchema = z.object({
  label: z.string().min(1).max(50).optional(),
  dailyLimit: z.number().int().min(1).max(1000).optional(),
  accountAge: z.enum(UMUR_NOMOR).optional(),
});

export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;
export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>;
