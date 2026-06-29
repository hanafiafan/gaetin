"use client";

import { useEffect, useRef, useState } from "react";
import { Inbox, Send, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Convo {
  id: string;
  name: string | null;
  phone: string;
  status: string;
  unreadCount: number;
}
interface Msg {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  content: string | null;
  createdAt: string;
}
interface Thread {
  conversation: { id: string; status: string; contact: { name: string | null; phone: string } };
  messages: Msg[];
}

export default function InboxClient() {
  const [convos, setConvos] = useState<Convo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
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

  function select(id: string) {
    setSelectedId(id);
    setThread(null);
    loadThread(id);
    if (threadTimer.current) clearInterval(threadTimer.current);
    threadTimer.current = setInterval(() => loadThread(id), 4000);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !reply.trim()) return;
    setSending(true);
    const r = await fetch(`/api/conversations/${selectedId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: reply }),
    });
    setSending(false);
    if (r.ok) { setReply(""); loadThread(selectedId); }
    else { const j = await r.json(); alert(j?.error?.message ?? "Gagal mengirim"); }
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
    <div className="cg-card grid min-h-[640px] overflow-hidden rounded-2xl lg:grid-cols-[340px_1fr]">
      {/* Conversation list */}
      <div className="overflow-y-auto border-r border-border">
        <div className="sticky top-0 z-10 border-b border-border bg-[#0d1020] p-4">
          <div className="flex items-center gap-2 font-black text-foreground">
            <Inbox className="h-5 w-5 text-primary" />
            Percakapan
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{convos.length} thread tersedia</p>
        </div>
        {convos.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">Belum ada percakapan masuk.</p>
        )}
        {convos.map((c) => (
          <button
            key={c.id}
            onClick={() => select(c.id)}
            className={cn(
              "flex w-full items-center justify-between gap-3 border-b border-border/50 p-4 text-left transition hover:bg-muted/50",
              selectedId === c.id && "bg-primary/[0.06] border-l-2 border-l-primary"
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{c.name ?? `+${c.phone}`}</p>
                <p className="truncate text-xs text-muted-foreground">+{c.phone} · {c.status}</p>
              </div>
            </div>
            {c.unreadCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-foreground">
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
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
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
              <select
                value={thread.conversation.status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-9 rounded-xl border border-border bg-card px-2 text-xs text-foreground"
              >
                <option value="OPEN">Baru</option>
                <option value="PENDING">Ditangani</option>
                <option value="RESOLVED">Selesai</option>
              </select>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-white/[0.01] p-4">
              {thread.messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.direction === "OUTBOUND" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                      m.direction === "OUTBOUND"
                        ? "rounded-br-sm bg-primary text-foreground"
                        : "rounded-bl-sm border border-border bg-muted text-slate-200"
                    )}
                  >
                    {m.content}
                    <p className={cn("mt-1 text-[10px]", m.direction === "OUTBOUND" ? "text-foreground/60" : "text-muted-foreground")}>
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
                className="flex h-11 items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-4 text-sm font-bold text-primary transition hover:bg-primary/25 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Kirim
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
