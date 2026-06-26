"use client";

export default function ImpersonationBanner({ workspaceName }: { workspaceName: string }) {
  async function stop() {
    await fetch("/api/admin/impersonate/stop", { method: "POST" });
    window.location.href = "/admin";
  }
  return (
    <div className="flex items-center justify-between gap-3 bg-amber-500/15 px-6 py-2 text-sm text-amber-800">
      <span>
        Mode impersonate: <span className="font-medium">{workspaceName}</span> — Anda melihat sebagai workspace ini.
      </span>
      <button onClick={stop} className="rounded-md border border-amber-600/40 px-3 py-1 text-xs font-medium hover:bg-amber-500/20">
        Keluar
      </button>
    </div>
  );
}
