"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkspaceOption {
  id: string;
  name: string;
  role: string;
}

const ROLE_LABEL: Record<string, string> = { OWNER: "Pemilik", ADMIN: "Admin", AGENT: "Agent" };

/**
 * Pemilih workspace.
 *
 * Satu akun bisa jadi anggota beberapa workspace — itulah yang terjadi begitu
 * rekan kerja menambahkanmu lewat halaman Anggota Tim. Sebelum ini yang
 * terbuka selalu workspace tertua milik akun itu sendiri, jadi orang yang
 * baru diundang tidak melihat apa pun berubah dan tidak menemukan cara masuk.
 * Daftarnya hanya muncul kalau memang ada lebih dari satu.
 */
export default function WorkspaceSwitcher({
  current,
  workspaces,
  className,
}: {
  current: string;
  workspaces: WorkspaceOption[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pindah, setPindah] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);

  // Dibuka dengan klik, bukan hover, dan bertahan sampai ditutup.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (workspaces.length < 2) {
    return <span className={cn("block truncate text-xs text-muted-foreground", className)}>{current}</span>;
  }

  const currentId = workspaces.find((w) => w.name === current)?.id;

  async function pilih(id: string) {
    setPindah(id);
    const r = await fetch("/api/workspaces/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: id }),
    });
    if (!r.ok) { setPindah(null); return; }
    // Muat ulang penuh: hampir semua isi halaman dirender di server menurut
    // workspace yang sedang dibuka.
    window.location.href = "/dashboard";
  }

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex min-h-9 w-full items-center gap-1 text-left text-xs text-muted-foreground transition hover:text-foreground"
      >
        <span className="min-w-0 flex-1 truncate">{current}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-[260px] max-w-[85vw] overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-2xl">
          <p className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">Pindah workspace</p>
          {workspaces.map((w) => {
            const aktif = w.id === currentId;
            return (
              <button
                key={w.id}
                type="button"
                role="menuitem"
                disabled={aktif || pindah !== null}
                onClick={() => pilih(w.id)}
                className={cn(
                  "flex min-h-11 w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition disabled:cursor-default",
                  aktif ? "bg-primary/15 text-foreground" : "text-foreground/85 hover:bg-foreground/5",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{w.name}</span>
                  <span className="block text-xs text-muted-foreground">{ROLE_LABEL[w.role] ?? w.role}</span>
                </span>
                {pindah === w.id ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : aktif ? <Check className="h-4 w-4 shrink-0" /> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
