import { describe, it, expect } from "vitest";
import { handleIncomingMessage, PermanentIncomingError } from "@/lib/inbox/service";

/**
 * Antrean webhook gateway berurutan dan BERHENTI di peristiwa pertama yang
 * gagal. Jadi "gagal sementara" dan "gagal permanen" bukan sekadar label:
 * salah menandai satu pesan cacat sebagai sementara membuat setiap balasan
 * pelanggan sesudahnya tidak pernah sampai ke Pesan Masuk — persis kelas bug
 * yang membuat halaman itu terlihat kosong padahal WhatsApp-nya ramai.
 */
describe("peristiwa pesan masuk yang cacat", () => {
  it("nomor yang menormalkan jadi kosong ditolak permanen, bukan disuruh coba lagi", async () => {
    await expect(handleIncomingMessage("akun", "+", "halo", "MSG-1")).rejects.toBeInstanceOf(PermanentIncomingError);
  });

  it("pesan tanpa id juga permanen — id itu yang dipakai menyaring kiriman ganda", async () => {
    await expect(handleIncomingMessage("akun", "628123456789", "halo", undefined)).rejects.toBeInstanceOf(PermanentIncomingError);
  });
});
