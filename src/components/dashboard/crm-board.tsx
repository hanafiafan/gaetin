"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeDollarSign, CalendarClock, GripVertical, Plus, Trophy } from "lucide-react";
import MetricStrip from "@/components/dashboard/metric-strip";
import ContactPanel from "@/components/dashboard/contact-panel";
import { isWonColumn, STAGE_LABEL } from "@/lib/crm/stages";

interface Card {
  id: string;
  contactId: string;
  name: string | null;
  phone: string;
  score: number;
  openTasks: number;
  nextDueDate: string | null;
  wonValue: number;
}

/** Kartu yang baru dipindah ke kolom "jadi beli", menunggu nilainya dicatat. */
interface DealDraft {
  card: Card;
  columnName: string;
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
  const [openContactId, setOpenContactId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DealDraft | null>(null);
  const [dealValue, setDealValue] = useState("");
  const [savingDeal, setSavingDeal] = useState(false);
  const dragged = useRef<Card | null>(null);
  const didDrag = useRef(false);

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
    // Nilai penjualan dulu diminta lewat window.prompt bawaan browser: kotak
    // abu-abu tanpa format rupiah, tanpa nama kontak yang jelas, dan menutupi
    // seluruh halaman. Sekarang formnya di dalam aplikasi, dan bisa dilewati
    // tanpa kehilangan perpindahan kartunya.
    if (isWonColumn(col.name)) {
      setDraft({ card, columnName: STAGE_LABEL[col.name] ?? col.name });
      setDealValue("");
    }
    load();
  }

  async function simpanDeal(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    const nilai = Number(dealValue.replace(/[^\d]/g, ""));
    setSavingDeal(true);
    const r = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactId: draft.card.contactId,
        title: `Penjualan ${draft.card.name ?? draft.card.phone}`,
        value: Number.isFinite(nilai) ? nilai : 0,
        status: "WON",
      }),
    });
    setSavingDeal(false);
    if (!r.ok) {
      const j = await r.json().catch(() => null);
      alert(j?.error?.message ?? "Nilai penjualan gagal disimpan");
      return;
    }
    setDraft(null);
    setDealValue("");
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
      <MetricStrip
        items={[
          { label: "Uang masuk", value: formatIDR(revenue), icon: BadgeDollarSign, accent: true },
          { label: "Penjualan jadi", value: String(wonCount), icon: Trophy },
        ]}
        aside={
          <button
            onClick={openAdd}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Tambahkan kontak ke sini
          </button>
        }
      />

      {adding && (
        <div className="cg-card rounded-xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Pilih kontak — akan masuk ke kolom pertama</span>
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
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:border-primary/30 hover:text-foreground"
              >
                {c.name ?? `+${c.phone}`}
              </button>
            ))}
            {contacts.length === 0 && <span className="text-sm text-muted-foreground">Tidak ada kontak.</span>}
          </div>
        </div>
      )}

      <div className="cg-scrollfade-x flex gap-4 overflow-x-auto pb-2">
        {columns.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(col)}
            className="flex min-h-[22rem] w-56 shrink-0 grow flex-col overflow-hidden rounded-xl border border-border bg-muted/40"
          >
            <div
              className="flex items-center gap-2 border-b-2 bg-background p-3"
              style={{ borderBottomColor: col.color ?? "#888" }}
            >
              <span className="h-2 w-2 shrink-0" style={{ backgroundColor: col.color ?? "#888" }} />
              <span className="cg-label">{STAGE_LABEL[col.name] ?? col.name}</span>
              <span className="ml-auto cg-label text-muted-foreground">{col.cards.length}</span>
            </div>
            <div className="flex flex-1 flex-col space-y-2 p-3">
              {col.cards.map((card) => {
                const jatuhTempo = card.nextDueDate ? new Date(card.nextDueDate) : null;
                const terlambat = jatuhTempo ? jatuhTempo.getTime() < Date.now() : false;
                return (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => { dragged.current = card; didDrag.current = true; }}
                    onDragEnd={() => { setTimeout(() => { didDrag.current = false; }, 0); }}
                    // Kartu dulu hanya bisa digeser. Sekarang diklik untuk
                    // membuka seluruh riwayat kontaknya — papan tanpa isi
                    // percakapan memang tidak bisa menjawab "kenapa peluang ini
                    // mandek".
                    onClick={() => { if (!didDrag.current) setOpenContactId(card.contactId); }}
                    className="cursor-grab rounded-lg border border-border bg-background p-3 text-sm shadow-none transition hover:border-foreground active:cursor-grabbing"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-foreground">{card.name ?? `+${card.phone}`}</p>
                        <p className="text-xs text-muted-foreground">+{card.phone} · skor {card.score}</p>

                        {card.wonValue > 0 && (
                          <p className="mt-1.5 text-xs font-semibold text-success">{formatIDR(card.wonValue)}</p>
                        )}

                        {jatuhTempo && (
                          <p className={`mt-1.5 flex items-center gap-1 text-xs ${terlambat ? "font-semibold text-destructive" : "text-muted-foreground"}`}>
                            <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                            {terlambat ? "Terlambat " : ""}
                            {jatuhTempo.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            {card.openTasks > 1 ? ` · ${card.openTasks} tugas` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {col.cards.length === 0 && (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  Geser kartu ke sini.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {draft && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button type="button" aria-label="Tutup" onClick={() => setDraft(null)} className="absolute inset-0 bg-foreground/40" />
          <form onSubmit={simpanDeal} className="relative w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-2xl">
            <h2 className="text-base font-semibold text-foreground">Catat nilai penjualan</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {draft.card.name ?? `+${draft.card.phone}`} sudah masuk kolom {draft.columnName}. Berapa nilai penjualannya?
            </p>
            <div className="mt-4">
              <label className="text-sm font-medium text-foreground" htmlFor="nilai-penjualan">Nilai (Rupiah)</label>
              <input
                id="nilai-penjualan"
                autoFocus
                inputMode="numeric"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="mis. 2500000"
                className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
              />
              {dealValue && <p className="mt-1.5 text-sm text-muted-foreground">{formatIDR(Number(dealValue))}</p>}
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="submit"
                disabled={savingDeal || !dealValue}
                className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-foreground hover:text-background disabled:opacity-40"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="h-10 rounded-lg border border-border px-4 text-sm font-semibold text-foreground/80 transition hover:border-foreground/30 hover:text-foreground"
              >
                Nanti saja
              </button>
            </div>
          </form>
        </div>
      )}

      <ContactPanel contactId={openContactId} onClose={() => setOpenContactId(null)} />
    </div>
  );
}
