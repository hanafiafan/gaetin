"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

type Status = "idle" | "saving" | "saved" | "error";

export default function WorkspaceProfileSettings() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/settings/workspace");
      const j = await r.json();
      if (j.success) {
        setName(j.data.name);
        setSlug(j.data.slug);
        setCreatedAt(new Date(j.data.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
      }
    })();
  }, []);

  async function save() {
    if (!name.trim()) return;
    setStatus("saving");
    setError("");
    const r = await fetch("/api/settings/workspace", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const j = await r.json();
    if (!r.ok) { setError(j?.error?.message ?? "Gagal menyimpan"); setStatus("error"); return; }
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground">Nama workspace</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nama bisnis Anda"
            className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
          />
          <p className="text-xs text-muted-foreground">Nama ini ditampilkan di header dan notifikasi.</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground">Slug (ID unik)</label>
          <input
            value={slug}
            disabled
            className="h-10 w-full rounded-xl border border-border bg-card px-3 font-mono text-sm text-muted-foreground cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">Tidak bisa diubah setelah dibuat.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 text-xs text-muted-foreground">
        Workspace dibuat pada <span className="font-medium text-muted-foreground">{createdAt || "—"}</span>
      </div>

      {error && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <button
        onClick={save}
        disabled={status === "saving" || !name.trim()}
        className="flex h-10 items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-5 text-sm font-bold text-primary transition hover:bg-primary/25 disabled:opacity-50"
      >
        {status === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "saved" && <CheckCircle2 className="h-4 w-4" />}
        {status === "saved" ? "Tersimpan" : "Simpan"}
      </button>
    </div>
  );
}
