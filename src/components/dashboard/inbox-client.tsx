"use client";

import { useEffect, useRef, useState } from "react";
import { Inbox, Send, UserCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    if (r.ok) {
      setReply("");
      loadThread(selectedId);
    } else {
      const j = await r.json();
      alert(j?.error?.message ?? "Gagal mengirim");
    }
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
    <div className="grid min-h-[640px] overflow-hidden rounded-2xl border bg-card shadow-sm lg:grid-cols-[340px_1fr]">
      <div className="overflow-y-auto border-r bg-muted/20">
        <div className="sticky top-0 z-10 border-b bg-card p-4">
          <div className="flex items-center gap-2 font-semibold">
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
              "flex w-full items-center justify-between gap-3 border-b p-4 text-left hover:bg-muted/50",
              selectedId === c.id && "bg-card",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
              <div className="truncate text-sm font-medium">{c.name ?? `+${c.phone}`}</div>
              <div className="truncate text-xs text-muted-foreground">+{c.phone} · {c.status}</div>
              </div>
            </div>
            {c.unreadCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {c.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex min-w-0 flex-col">
        {!thread ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
            <div>
              <MessageEmpty />
              <p className="mt-3">Pilih percakapan untuk melihat riwayat dan membalas.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b bg-card p-4">
              <div>
                <div className="text-sm font-semibold">
                  {thread.conversation.contact.name ?? `+${thread.conversation.contact.phone}`}
                </div>
                <div className="text-xs text-muted-foreground">+{thread.conversation.contact.phone}</div>
              </div>
              <select
                value={thread.conversation.status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="OPEN">Baru</option>
                <option value="PENDING">Ditangani</option>
                <option value="RESOLVED">Selesai</option>
              </select>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
              {thread.messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.direction === "OUTBOUND" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                      m.direction === "OUTBOUND"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm border bg-card",
                    )}
                  >
                    {m.content}
                    <div className={cn("mt-1 text-[10px]", m.direction === "OUTBOUND" ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {new Date(m.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={send} className="flex gap-2 border-t bg-card p-3">
              <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Ketik balasan..." className="h-11" />
              <Button type="submit" className="h-11 rounded-full" disabled={sending || !reply.trim()}>
                <Send className="mr-2 h-4 w-4" />
                Kirim
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function MessageEmpty() {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      <Inbox className="h-7 w-7" />
    </div>
  );
}
