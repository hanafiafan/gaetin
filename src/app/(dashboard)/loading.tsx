/**
 * Setiap halaman dashboard adalah server component yang menunggu Prisma, dan
 * tanpa berkas ini navigasi tidak memberi tanda apa pun — user mengklik menu
 * lalu menatap halaman lama sampai data siap, dan sering mengklik dua kali.
 * Kerangka ini mengikuti bentuk umum halaman: pita hero lalu deretan kartu.
 */
export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat halaman…</span>

      <div className="h-40 rounded-2xl bg-foreground/[0.06]" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-foreground/[0.06]" />
        ))}
      </div>

      <div className="h-64 rounded-2xl bg-foreground/[0.06]" />
    </div>
  );
}
