"use client";

import { errorMessage, requestJson } from "@/lib/http/client";

export default function ImpersonationBanner({ workspaceName }: { workspaceName: string }) {
  async function stop() {
    try {
      await requestJson("/api/admin/impersonate/stop", { method: "POST" }, "Gagal keluar dari mode impersonasi");
      window.location.href = "/admin";
    } catch (error) {
      alert(errorMessage(error, "Gagal keluar dari mode impersonasi"));
    }
  }
  return (
    <div className="flex items-center justify-between gap-3 bg-warning/15 px-6 py-2 text-sm text-amber-800">
      <span>
        Mode impersonate: <span className="font-medium">{workspaceName}</span> — Anda melihat sebagai workspace ini.
      </span>
      <button onClick={stop} className="rounded-md border border-warning/40 px-3 py-1 text-xs font-medium hover:bg-warning/20">
        Keluar
      </button>
    </div>
  );
}
