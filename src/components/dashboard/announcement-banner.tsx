"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Ann {
  id: string;
  message: string;
  type: "INFO" | "WARNING" | "PROMO" | string;
}

const STYLE: Record<string, string> = {
  INFO: "bg-blue-500/10 text-blue-700",
  WARNING: "bg-amber-500/10 text-amber-700",
  PROMO: "bg-green-500/10 text-green-700",
};

export default function AnnouncementBanner() {
  const [items, setItems] = useState<Ann[]>([]);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/announcements");
      const j = await r.json();
      if (j.success) setItems(j.data);
    })();
  }, []);

  if (items.length === 0) return null;
  return (
    <div className="mb-4 space-y-2">
      {items.map((a) => (
        <div key={a.id} className={cn("rounded-md px-4 py-2 text-sm", STYLE[a.type] ?? STYLE.INFO)}>
          {a.message}
        </div>
      ))}
    </div>
  );
}
