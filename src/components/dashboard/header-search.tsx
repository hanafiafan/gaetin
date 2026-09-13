"use client";

import { useEffect, useRef, useState } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && inputRef.current?.getClientRects().length) {
        event.preventDefault();
        inputRef.current.focus();
        inputRef.current.select();
      }
    };
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        if (term) router.push(`/dashboard/contacts?q=${encodeURIComponent(term)}`);
      }}
      className="hidden h-10 w-[164px] items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 transition focus-within:border-primary/60 xl:flex 2xl:w-[220px]"
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        ref={inputRef}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari kontak…"
        aria-label="Cari kontak"
        title="Cari kontak · Command K atau Ctrl K"
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
      <kbd aria-hidden="true" className="hidden shrink-0 rounded border border-border px-1 text-[10px] text-muted-foreground 2xl:block">⌘K</kbd>
    </form>
  );
}
