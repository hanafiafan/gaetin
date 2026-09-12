import { describe, it, expect } from "vitest";
import { buildTimeline, summarize, rupiah } from "@/lib/contacts/timeline";

const d = (iso: string) => new Date(iso);

const sources = {
  messages: [
    { id: "m1", direction: "INBOUND", content: "Boleh kirim harganya?", status: "DELIVERED", createdAt: d("2026-09-10T03:00:00Z") },
    { id: "m2", direction: "OUTBOUND", content: "Siap, saya kirim.", status: "SENT", createdAt: d("2026-09-10T04:00:00Z") },
  ],
  notes: [{ id: "n1", body: "Ditelepon, minta diskon.", createdAt: d("2026-09-12T01:00:00Z") }],
  tasks: [
    { id: "t1", title: "Telepon ulang", description: null, status: "PENDING", dueDate: d("2026-09-15T02:00:00Z"), createdAt: d("2026-09-11T02:00:00Z") },
    { id: "t2", title: "Kirim invoice", description: null, status: "COMPLETED", dueDate: d("2026-09-09T02:00:00Z"), createdAt: d("2026-09-08T02:00:00Z") },
  ],
  deals: [
    { id: "d1", title: "Paket bulanan", value: 12_500_000, status: "WON", createdAt: d("2026-09-11T05:00:00Z") },
    { id: "d2", title: "Tambahan kursi", value: 2_000_000, status: "OPEN", createdAt: d("2026-09-07T05:00:00Z") },
  ],
};

describe("riwayat kontak", () => {
  it("menggabungkan semua sumber tanpa ada yang hilang", () => {
    expect(buildTimeline(sources)).toHaveLength(7);
  });

  it("mengurutkan dari yang terbaru, lintas sumber", () => {
    const at = buildTimeline(sources).map((e) => e.at);
    expect(at).toEqual([...at].sort().reverse());
    expect(buildTimeline(sources)[0].id).toBe("note-n1");
  });

  it("membedakan pesan masuk dan keluar", () => {
    const kinds = buildTimeline(sources).filter((e) => e.id.startsWith("msg-")).map((e) => e.kind);
    expect(kinds).toEqual(["OUTBOUND", "INBOUND"]);
  });

  it("hanya menjumlahkan penjualan yang jadi", () => {
    const s = summarize(sources);
    expect(s.wonValue).toBe(12_500_000);
    expect(s.openTasks).toBe(1);
    expect(s.inbound).toBe(1);
    expect(s.outbound).toBe(1);
  });

  it("kontak tanpa riwayat menghasilkan daftar kosong, bukan error", () => {
    const kosong = { messages: [], notes: [], tasks: [], deals: [] };
    expect(buildTimeline(kosong)).toEqual([]);
    expect(summarize(kosong).wonValue).toBe(0);
  });

  it("memformat rupiah dengan pemisah ribuan", () => {
    expect(rupiah(12_500_000)).toBe("Rp 12.500.000");
    expect(rupiah(null)).toBe("Rp 0");
  });
});
