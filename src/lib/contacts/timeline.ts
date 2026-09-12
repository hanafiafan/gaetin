/**
 * Menggabungkan empat sumber riwayat satu kontak jadi satu urutan waktu.
 *
 * Dipisah dari route-nya supaya bisa diuji tanpa database: yang gampang salah
 * di sini bukan query-nya, tapi urutannya — empat daftar yang masing-masing
 * sudah terurut tidak otomatis terurut setelah digabung.
 */

export type TimelineKind = "INBOUND" | "OUTBOUND" | "NOTE" | "TASK" | "DEAL";

export interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  at: string;
  title: string;
  body?: string | null;
  meta?: string | null;
}

export interface TimelineSources {
  messages: { id: string; direction: string; content: string | null; status: string; createdAt: Date }[];
  notes: { id: string; body: string; createdAt: Date }[];
  tasks: { id: string; title: string; description: string | null; status: string; dueDate: Date; createdAt: Date }[];
  deals: { id: string; title: string; value: unknown; status: string; createdAt: Date }[];
}

// Status pesan disimpan sebagai enum Inggris; yang dibaca orang jangan.
const STATUS_PESAN: Record<string, string> = {
  PENDING: "Menunggu dikirim",
  SENT: "Terkirim",
  DELIVERED: "Sampai",
  READ: "Dibaca",
  FAILED: "Gagal",
};

export function rupiah(value: unknown): string {
  return `Rp ${Number(value ?? 0).toLocaleString("id-ID")}`;
}

export function buildTimeline(src: TimelineSources): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    ...src.messages.map((m) => ({
      id: `msg-${m.id}`,
      kind: (m.direction === "INBOUND" ? "INBOUND" : "OUTBOUND") as TimelineKind,
      at: m.createdAt.toISOString(),
      title: m.direction === "INBOUND" ? "Pesan masuk" : "Pesan terkirim",
      body: m.content,
      meta: STATUS_PESAN[m.status] ?? null,
    })),
    ...src.notes.map((n) => ({
      id: `note-${n.id}`,
      kind: "NOTE" as TimelineKind,
      at: n.createdAt.toISOString(),
      title: "Catatan",
      body: n.body,
    })),
    ...src.tasks.map((t) => ({
      id: `task-${t.id}`,
      kind: "TASK" as TimelineKind,
      at: t.createdAt.toISOString(),
      title: t.title,
      body: t.description,
      meta: t.status === "COMPLETED" ? "Selesai" : `Jatuh tempo ${t.dueDate.toLocaleDateString("id-ID")}`,
    })),
    ...src.deals.map((d) => ({
      id: `deal-${d.id}`,
      kind: "DEAL" as TimelineKind,
      at: d.createdAt.toISOString(),
      title: d.title,
      body: rupiah(d.value),
      meta: d.status === "WON" ? "Jadi beli" : d.status === "LOST" ? "Batal" : "Masih berjalan",
    })),
  ];

  // Terbaru di atas. Perbandingan string ISO aman: formatnya panjang tetap dan
  // selalu UTC, jadi urutan leksikografisnya sama dengan urutan waktunya.
  return entries.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
}

export function summarize(src: TimelineSources) {
  return {
    inbound: src.messages.filter((m) => m.direction === "INBOUND").length,
    outbound: src.messages.filter((m) => m.direction !== "INBOUND").length,
    openTasks: src.tasks.filter((t) => t.status !== "COMPLETED").length,
    wonValue: src.deals.filter((d) => d.status === "WON").reduce((sum, d) => sum + Number(d.value ?? 0), 0),
  };
}
