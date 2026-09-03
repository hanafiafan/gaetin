"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeDollarSign, GripVertical, Plus, Trophy } from "lucide-react";

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
    if (jd.success) { setRevenue(jd.data.revenue); setWonCount(jd.data.wonCount); }
  }
  useEffect(() => { load(); }, []);

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
    if (r.ok) { setAdding(false); load(); }
    else { const j = await r.json(); alert(j?.error?.message ?? "Gagal menambah"); }
  }

  return (
    <div className="space-y-4">
      <div className="cg-card rounded-2xl p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-primary/10 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-foreground">
                <BadgeDollarSign className="h-4 w-4" />
                Revenue closing
              </div>
              <p className="mt-1 text-2xl font-black text-foreground">{formatIDR(revenue)}</p>
            </div>
            <div className="rounded-xl bg-success/10 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-success">
                <Trophy className="h-4 w-4" />
                Deal menang
              </div>
              <p className="mt-1 text-2xl font-black text-foreground">{wonCount}</p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="flex h-10 items-center gap-2 border border-border px-4 text-sm font-bold text-foreground/80 transition hover:border-primary/30 hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Tambah kontak ke pipeline
          </button>
        </div>
      </div>

      {adding && (
        <div className="cg-card rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Pilih kontak (masuk kolom pertama)</span>
            <button
              onClick={() => setAdding(false)}
              className="text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Tutup
            </button>
          </div>
          <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
            {contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => addToBoard(c.id)}
                className="border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:border-primary/30 hover:text-foreground"
              >
                {c.name ?? `+${c.phone}`}
              </button>
            ))}
            {contacts.length === 0 && <span className="text-sm text-muted-foreground">Tidak ada kontak.</span>}
          </div>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto border-t border-foreground pt-4 pb-2">
        {columns.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(col)}
            className="flex min-h-[22rem] w-72 shrink-0 flex-col border border-border bg-muted/40"
          >
            <div
              className="flex items-center gap-2 border-b-2 bg-background p-3"
              style={{ borderBottomColor: col.color ?? "#888" }}
            >
              <span className="h-2 w-2 shrink-0" style={{ backgroundColor: col.color ?? "#888" }} />
              <span className="cg-label">{col.name}</span>
              <span className="ml-auto cg-label text-muted-foreground">{col.cards.length}</span>
            </div>
            <div className="flex flex-1 flex-col space-y-2 p-3">
              {col.cards.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => { dragged.current = card; }}
                  className="cursor-grab border border-border bg-background p-3 text-sm shadow-none transition hover:border-foreground active:cursor-grabbing"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-foreground">{card.name ?? `+${card.phone}`}</p>
                      <p className="text-xs text-muted-foreground">+{card.phone} · skor {card.score}</p>
                    </div>
                  </div>
                </div>
              ))}
              {col.cards.length === 0 && (
                <div className="flex flex-1 items-center justify-center border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
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
