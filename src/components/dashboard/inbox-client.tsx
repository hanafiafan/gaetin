"use client";

import { useEffect, useRef, useState } from "react";
import { History, Inbox, Search, Send, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/dashboard/empty-state";
import ContactPanel from "@/components/dashboard/contact-panel";

interface Convo {
  id: string;
  contactId: string;
  name: string | null;
  phone: string;
  status: string;
  unreadCount: number;
  lastMessage: string | null;
  lastDirection: "INBOUND" | "OUTBOUND" | null;
}
interface Msg {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  content: string | null;
  createdAt: string;
}
interface Thread {
  conversation: { id: string; status: string; contact: { id: string; name: string | null; phone: string } };
  messages: Msg[];
}

/** Label status percakapan. Daftar di kiri sebelumnya menampilkan nilai enum
 * mentah ("OPEN", "PENDING"), sementara dropdown di panel kanan sudah memakai
 * bahasa Indonesia — dua tampilan berbeda untuk data yang sama. */
const STATUS_LABEL: Record<string, string> = {
  OPEN: "Baru",
  PENDING: "Ditangani",
  RESOLVED: "Selesai",
};

export default function InboxClient() {
  const [convos, setConvos] = useState<Convo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState("");
  const [historyFor, setHistoryFor] = useState<string | null>(null);
  const convoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const threadTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadConvos() {
    const r = await fetch("/api/conversations");
    const j = await r.json();
    if (j.success) setConvos(j.data);
  }
  async function loadThread(id: string) {
    const r = await fetch(`/api/conversations/${id}`);
    const j = await r.json();
    if (j.success) setThread(j.data);
  }

  useEffect(() => {
    loadConvos();
    convoTimer.current = setInterval(loadConvos, 5000);
    return () => {
      if (convoTimer.current) clearInterval(convoTimer.current);
      if (threadTimer.current) clearInterval(threadTimer.current);
    };
  }, []);

  // Penyaringan di sisi klien: daftarnya dibatasi 200 percakapan dan sudah ada
  // di memori, jadi mengirim setiap ketikan ke server hanya menambah tunggu.
  const shown = convos.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [c.name, c.phone, c.lastMessage].some((v) => v?.toLowerCase().includes(q));
  });

  function select(id: string) {
    setSelectedId(id);
    setThread(null);
    loadThread(id);
    if (threadTimer.current) clearInterval(threadTimer.current);
    threadTimer.current = setInterval(() => loadThread(id), 4000);
  }

  const replyAttempt = useRef<{ conversation: string; text: string; id: string } | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !reply.trim()) return;
    if (sending) return;
    if (replyAttempt.current?.conversation !== selectedId || replyAttempt.current?.text !== reply) replyAttempt.current = { conversation: selectedId, text: reply, id: crypto.randomUUID() };
    setSending(true);
    try {
      const r = await fetch(`/api/conversations/${selectedId}/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reply, clientRequestId: replyAttempt.current.id }),
      });
      if (r.ok) { setReply(""); replyAttempt.current = null; loadThread(selectedId); }
      else { const j = await r.json(); alert(j?.error?.message ?? "Gagal mengirim"); }
    } catch { alert("Koneksi terputus. Coba lagi untuk memeriksa pengiriman pesan yang sama."); }
    finally { setSending(false); }
  }

  async function setStatus(status: string) {
    if (!selectedId) return;
    await fetch(`/api/conversations/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadThread(selectedId);
    loadConvos();
  }

  return (
    <div className="cg-card cg-tone-top grid min-h-[640px] overflow-hidden rounded-xl lg:grid-cols-[340px_1fr]">
      {/* Conversation list */}
      <div className="overflow-y-auto border-r border-border">
        <div className="sticky top-0 z-10 border-b border-border bg-background p-4">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Inbox className="h-5 w-5 text-foreground" />
            Percakapan
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{convos.length} percakapan</p>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama, nomor, atau isi pesan"
              aria-label="Cari percakapan"
              className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
            />
          </div>
        </div>
        {convos.length === 0 && (
          <div className="p-4">
            <EmptyState
              title="Belum ada percakapan masuk"
              hint="Balasan dari kontak muncul di sini setelah nomor WhatsApp tersambung dan kampanye pertama terkirim."
              action={{ href: "/dashboard/campaigns", label: "Buat kampanye" }}
            />
          </div>
        )}
        {shown.map((c) => (
          <button
            key={c.id}
            onClick={() => select(c.id)}
            className={cn(
              "flex w-full items-center justify-between gap-3 border-b border-border/50 p-4 text-left transition hover:bg-muted/50",
              selectedId === c.id && "bg-primary/[0.06] border-l-2 border-l-primary"
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-whatsapp/10 text-whatsapp">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{c.name ?? `+${c.phone}`}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.lastMessage
                    ? `${c.lastDirection === "INBOUND" ? "" : "Kamu: "}${c.lastMessage}`
                    : `+${c.phone} · ${STATUS_LABEL[c.status] ?? c.status}`}
                </p>
              </div>
            </div>
            {c.unreadCount > 0 && (
              <span className="rounded-lg bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                {c.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Thread panel */}
      <div className="flex min-w-0 flex-col">
        {!thread ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-whatsapp/10 text-whatsapp">
                <Inbox className="h-7 w-7" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Pilih percakapan untuk melihat riwayat dan membalas.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border bg-card p-4">
              <div>
                <p className="text-sm font-bold text-foreground">
                  {thread.conversation.contact.name ?? `+${thread.conversation.contact.phone}`}
                </p>
                <p className="text-xs text-muted-foreground">+{thread.conversation.contact.phone}</p>
              </div>
              <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHistoryFor(thread.conversation.contact.id)}
                className="flex h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-semibold text-foreground/80 transition hover:border-foreground/30 hover:text-foreground"
                title="Lihat seluruh riwayat kontak ini"
              >
                <History className="h-4 w-4" />
                Riwayat
              </button>
              <select
                value={thread.conversation.status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 rounded-lg border border-border bg-card px-2.5 text-sm text-foreground"
              >
                <option value="OPEN">{STATUS_LABEL.OPEN}</option>
                <option value="PENDING">{STATUS_LABEL.PENDING}</option>
                <option value="RESOLVED">{STATUS_LABEL.RESOLVED}</option>
              </select>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-muted p-4">
              {thread.messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.direction === "OUTBOUND" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-xl px-3 py-2 text-sm",
                      m.direction === "OUTBOUND"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm border border-border bg-muted text-foreground"
                    )}
                  >
                    {m.content}
                    <p className={cn("mt-1 text-xs", m.direction === "OUTBOUND" ? "text-foreground/60" : "text-muted-foreground")}>
                      {new Date(m.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Ketik balasan..."
                className="h-11 flex-1 rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className="flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Kirim
              </button>
            </form>
          </>
        )}
      </div>

      <ContactPanel contactId={historyFor} onClose={() => setHistoryFor(null)} />
    </div>
  );
}
