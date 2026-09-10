"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/**
 * Sebelumnya ini sebuah <div> yang dibentuk menyerupai kolom pencarian —
 * lengkap dengan ikon dan placeholder, tapi tidak bisa diklik maupun diketik.
 * Kontrol yang tampak interaktif tapi mati adalah hal pertama yang dicoba
 * user baru, jadi sekarang ia benar-benar berfungsi.
 *
 * Placeholder-nya juga dibuat jujur: dulu menjanjikan pencarian campaign,
 * template, dan workspace yang tidak pernah ada.
 */
export default function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        if (term) router.push(`/dashboard/contacts?q=${encodeURIComponent(term)}`);
      }}
      className="hidden h-10 w-[220px] items-center gap-2 rounded-xl border border-border px-3.5 transition focus-within:border-foreground/40 xl:flex"
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari kontak…"
        aria-label="Cari kontak"
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </form>
  );
}
