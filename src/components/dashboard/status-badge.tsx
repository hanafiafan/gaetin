import { cn } from "@/lib/utils";

/**
 * Satu badge status untuk seluruh dashboard.
 *
 * Sebelumnya ada dua implementasi StatusBadge terpisah (billing dan akun
 * WhatsApp), masing-masing dengan peta labelnya sendiri, sementara kampanye,
 * email blast, dan pencarian email mencetak nilai enum mentah — pengguna
 * melihat "DRAFT" dan "COMPLETED" alih-alih bahasa Indonesia.
 *
 * Daftar di bawah memetakan enum status yang tampil di layar. Kunci yang sama
 * dipakai beberapa domain (COMPLETED muncul di kampanye, blast, dan scraper)
 * dan artinya konsisten di sana.
 *
 * BATASAN: `PENDING` TIDAK konsisten antar-domain — "Menunggu" untuk transaksi,
 * "Ditangani" untuk percakapan inbox, "Belum" untuk tugas. Daftar ini memakai
 * arti transaksi. Inbox dan Tugas sengaja menyimpan peta labelnya sendiri;
 * jangan alihkan keduanya ke sini tanpa memisahkan kunci per domain lebih dulu.
 */

type Tone = "ok" | "warn" | "bad" | "idle" | "busy";

const TONE: Record<Tone, string> = {
  ok: "bg-success/15 text-success",
  warn: "bg-warning/15 text-warning",
  bad: "bg-destructive/15 text-destructive",
  idle: "bg-muted-foreground/15 text-muted-foreground",
  // Lime hanya sebagai isian, tidak pernah sebagai teks di atas putih.
  busy: "bg-primary/25 text-foreground",
};

const STATUS: Record<string, { label: string; tone: Tone }> = {
  // Langganan
  ACTIVE: { label: "Aktif", tone: "ok" },
  TRIAL: { label: "Trial", tone: "warn" },
  TRIAL_EXPIRED: { label: "Trial berakhir", tone: "bad" },
  BLOCKED: { label: "Diblokir", tone: "bad" },

  // Transaksi
  PAID: { label: "Lunas", tone: "ok" },
  PENDING: { label: "Menunggu", tone: "warn" },
  EXPIRED: { label: "Kedaluwarsa", tone: "bad" },
  CANCELLED: { label: "Dibatalkan", tone: "idle" },
  CHALLENGE: { label: "Perlu ditinjau", tone: "warn" },

  // Kampanye, blast, scraper, pencarian email
  DRAFT: { label: "Draf", tone: "idle" },
  SCHEDULED: { label: "Terjadwal", tone: "warn" },
  RUNNING: { label: "Berjalan", tone: "busy" },
  PAUSED: { label: "Dijeda", tone: "warn" },
  STOPPED: { label: "Dihentikan", tone: "idle" },
  COMPLETED: { label: "Selesai", tone: "ok" },
  FAILED: { label: "Gagal", tone: "bad" },
  SENT: { label: "Terkirim", tone: "ok" },

  // Percakapan
  OPEN: { label: "Baru", tone: "busy" },
  RESOLVED: { label: "Selesai", tone: "ok" },

  // Koneksi WhatsApp (lowercase di API gateway)
  connected: { label: "Tersambung", tone: "ok" },
  connecting: { label: "Menyambungkan", tone: "warn" },
  reconnecting: { label: "Menyambung ulang", tone: "warn" },
  disconnected: { label: "Terputus", tone: "idle" },
};

export default function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        s ? TONE[s.tone] : TONE.idle,
        className,
      )}
    >
      {s?.label ?? status}
    </span>
  );
}
