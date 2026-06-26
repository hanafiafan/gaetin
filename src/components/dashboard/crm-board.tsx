"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeDollarSign, GripVertical, Plus, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card as UiCard, CardContent } from "@/components/ui/card";

interface Card {
  id: string;
  contactId: string;
  name: string | null;
  phone: string;
  score: number;
}
interface Column {
  id: string;
  name: string;
  color: string | null;
  cards: Card[];
}
interface ContactLite {
  id: string;
  name: string | null;
  phone: string;
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function CrmBoard() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [wonCount, setWonCount] = useState(0);
  const [adding, setAdding] = useState(false);
  const [contacts, setContacts] = useState<ContactLite[]>([]);
  const dragged = useRef<Card | null>(null);

  async function load() {
    const [rc, rd] = await Promise.all([fetch("/api/crm"), fetch("/api/deals")]);
    const [jc, jd] = await Promise.all([rc.json(), rd.json()]);
    if (jc.success) setColumns(jc.data.columns);
    if (jd.success) {
      setRevenue(jd.data.revenue);
      setWonCount(jd.data.wonCount);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function onDrop(col: Column) {
    const card = dragged.current;
    dragged.current = null;
    if (!card) return;
    await fetch(`/api/crm/cards/${card.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId: col.id }),
    });
    if (/won|menang/i.test(col.name)) {
      const v = window.prompt(`Nilai deal untuk ${card.name ?? "kontak"} (Rp):`, "0");
      if (v !== null) {
        await fetch("/api/deals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contactId: card.contactId,
            title: `Deal ${card.name ?? card.phone}`,
            value: Number(v) || 0,
            status: "WON",
          }),
        });
      }
    }
    load();
  }

  async function openAdd() {
    const r = await fetch("/api/contacts?pageSize=50");
    const j = await r.json();
    if (j.success) setContacts(j.data.items);
    setAdding(true);
  }

  async function addToBoard(contactId: string) {
    const first = columns[0];
    if (!first) return;
    const r = await fetch("/api/crm/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId, columnId: first.id }),
    });
    if (r.ok) {
      setAdding(false);
      load();
    } else {
      const j = await r.json();
      alert(j?.error?.message ?? "Gagal menambah");
    }
  }

  return (
    <div className="space-y-4">
      <UiCard className="rounded-2xl shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-primary/10 p-4 text-primary">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase">
                <BadgeDollarSign className="h-4 w-4" />
                Revenue closing
              </div>
              <div className="mt-1 text-2xl font-semibold">{formatIDR(revenue)}</div>
            </div>
            <div className="rounded-xl bg-green-500/10 p-4 text-green-700 dark:text-green-400">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase">
                <Trophy className="h-4 w-4" />
                Deal menang
              </div>
              <div className="mt-1 text-2xl font-semibold">{wonCount}</div>
            </div>
          </div>
          <Button variant="outline" onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah kontak ke pipeline
          </Button>
        </CardContent>
      </UiCard>

      {adding && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Pilih kontak (masuk kolom pertama)</span>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Tutup</Button>
          </div>
          <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
            {contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => addToBoard(c.id)}
                className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted"
              >
                {c.name ?? `+${c.phone}`}
              </button>
            ))}
            {contacts.length === 0 && <span className="text-sm text-muted-foreground">Tidak ada kontak.</span>}
          </div>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(col)}
            className="flex w-72 shrink-0 flex-col rounded-2xl border bg-muted/20 shadow-sm"
          >
            <div className="flex items-center gap-2 border-b bg-card p-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: col.color ?? "#888" }} />
              <span className="text-sm font-medium">{col.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{col.cards.length}</span>
            </div>
            <div className="flex-1 space-y-2 p-3">
              {col.cards.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => {
                    dragged.current = card;
                  }}
                  className="cursor-grab rounded-xl border bg-card p-3 text-sm shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{card.name ?? `+${card.phone}`}</div>
                      <div className="text-xs text-muted-foreground">+{card.phone} · skor {card.score}</div>
                    </div>
                  </div>
                </div>
              ))}
              {col.cards.length === 0 && (
                <div className="rounded-xl border border-dashed bg-card/60 p-4 text-center text-xs text-muted-foreground">
                  Drop kartu ke stage ini.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
