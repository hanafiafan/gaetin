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

      <div className="space-y-3 py-3" aria-hidden="true">
        <div className="h-3 w-28 rounded-full bg-foreground/10" />
        <div className="h-9 w-3/5 max-w-sm rounded-lg bg-foreground/10" />
        <div className="h-4 w-4/5 max-w-lg rounded-full bg-foreground/[0.06]" />
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border lg:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4 bg-card p-6"><div className="h-3 w-20 rounded bg-foreground/10" /><div className="h-8 w-16 rounded bg-foreground/10" /></div>
        ))}
      </div>

      <div className="h-64 rounded-3xl bg-foreground/[0.08]" aria-hidden="true" />
    </div>
  );
}
