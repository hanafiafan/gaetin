import Link from "next/link";
import { BarChart3, CheckCircle2, MessageSquare, Send } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1fr)_520px]">
      <section className="hidden border-r bg-card/70 p-8 lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-sm font-black text-white shadow-sm">
            G
          </span>
          <span className="text-xl font-bold tracking-tight">Gaetin</span>
        </Link>

        <div className="flex flex-1 flex-col justify-center">
          <span className="mb-5 w-fit rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground">
            Workspace untuk operasional WhatsApp
          </span>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight">
            Masuk ke ruang kerja yang menghubungkan lead, WhatsApp, CRM, dan revenue.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
            Gaetin membantu bisnis mencari lead, menjalankan outreach, mengelola percakapan,
            dan membaca laporan penggunaan dalam satu ruang kerja.
          </p>

          <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-2">
            {[
              { label: "Pencarian lead", icon: BarChart3 },
              { label: "Kirim WhatsApp", icon: Send },
              { label: "Inbox & CRM", icon: MessageSquare },
              { label: "Setup cepat", icon: CheckCircle2 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border bg-background p-4 shadow-sm">
                  <Icon className="mb-3 h-5 w-5 text-primary" />
                  <div className="text-sm font-semibold">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-sm font-black text-white shadow-sm">
                G
              </span>
              <span className="text-2xl font-bold tracking-tight">Gaetin</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">Cari leads. Gaet pelanggan. Tutup deal.</p>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
