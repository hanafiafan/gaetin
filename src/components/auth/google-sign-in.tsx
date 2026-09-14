"use client";

/**
 * Tombol "lewat Google" beserta pesan kegagalannya.
 *
 * Dipakai halaman Masuk dan halaman Daftar. Route-nya satu dan sama: kalau
 * emailnya belum punya akun, akun barunya dibuat di situ juga — jadi tombol
 * yang sama memang melayani keduanya, hanya labelnya yang berbeda.
 */

/** Sebab kegagalan yang dikirim balik route callback, dalam bahasa manusia. */
export const PESAN_ERROR_GOOGLE: Record<string, string> = {
  google_belum_disetel: "Masuk dengan Google belum disetel di sistem ini. Hubungi admin workspace Anda.",
  google_dibatalkan: "Masuk dengan Google dibatalkan.",
  google_email_belum_terverifikasi: "Email Google Anda belum terverifikasi, jadi belum bisa dipakai masuk.",
  google_state_tidak_cocok: "Sesi masuk sudah kedaluwarsa. Coba tekan tombolnya sekali lagi.",
  google_balasan_tidak_lengkap: "Balasan dari Google tidak lengkap. Coba lagi.",
  google_gagal_menukar_kode: "Gagal memverifikasi akun Google. Coba lagi sebentar lagi.",
  google_token_tidak_sah: "Balasan dari Google tidak bisa diverifikasi. Coba lagi.",
};

export function pesanErrorGoogle(kode: string | null): string | null {
  if (!kode) return null;
  return PESAN_ERROR_GOOGLE[kode] ?? "Masuk dengan Google gagal. Coba lagi.";
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.2 5.4-4.7 7l7.6 5.9c4.4-4.1 6.8-10.1 6.8-17.4z" />
      <path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C1 16.3 0 20 0 24s1 7.7 2.6 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.2-8.3 2.2-6.4 0-11.7-3.7-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

/** Tombol beserta pemisah "atau pakai email" di bawahnya. */
export default function GoogleSignIn({ label }: { label: string }) {
  return (
    <>
      <a
        href="/api/auth/google"
        className="mb-4 flex h-12 w-full items-center justify-center gap-3 border border-border bg-card text-sm font-bold text-foreground transition hover:border-foreground/40"
      >
        <GoogleMark />
        {label}
      </a>
      <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        atau pakai email
        <span className="h-px flex-1 bg-border" />
      </div>
    </>
  );
}
