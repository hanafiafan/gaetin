import InboxClient from "@/components/dashboard/inbox-client";
import { Badge } from "@/components/ui/badge";
import { Headphones, MessageSquare, Sparkles, UserCheck } from "lucide-react";

export default function InboxPage() {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10">
              <Sparkles className="h-3.5 w-3.5" />
              Conversation Hub
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Inbox</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Balasan WhatsApp masuk di sini. Balas cepat, ubah status percakapan, dan jaga momentum closing.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Percakapan dua arah
            </div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
              <UserCheck className="h-4 w-4 text-primary" />
              Status open, pending, resolved
            </div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
              <Headphones className="h-4 w-4 text-primary" />
              Cocok untuk sales dan customer support
            </div>
          </div>
        </div>
      </div>
      <InboxClient />
    </div>
  );
}
