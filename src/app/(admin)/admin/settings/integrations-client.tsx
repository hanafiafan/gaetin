"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Globe,
  KeyRound,
  LogIn,
  Mail,
  MessageSquare,
  Save,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { saveMidtransSettings, saveGatewaySettings, saveEmailSettings, saveGoogleLoginSettings } from "@/app/actions/admin-settings";

type Props = { settings: Record<string, string> };

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{className?: string}>; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="cg-card overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 border-b border-border px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-foreground">
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-sm font-black text-foreground">{title}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-6 py-5">{children}</div>}
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, defaultValue, hint }: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-foreground">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder-slate-600 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
      />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SaveButton({ pending, saved }: { pending: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
    >
      {saved ? (
        <><CheckCircle2 className="h-4 w-4" /> Tersimpan</>
      ) : pending ? (
        <><span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-white" /> Menyimpan…</>
      ) : (
        <><Save className="h-4 w-4" /> Simpan</>
      )}
    </button>
  );
}

export default function AdminIntegrationsClient({ settings }: Props) {
  const [midtransPending, startMidtrans] = useTransition();
  const [gatewayPending, startGateway] = useTransition();
  const [emailPending, startEmail] = useTransition();
  const [googlePending, startGoogle] = useTransition();
  // Diambil dari alamat yang sedang dibuka: itu persis alamat yang harus
  // didaftarkan di Google, jadi tidak ada yang perlu ditebak atau diketik.
  const appUrl = typeof window === "undefined" ? "https://scraper.hellens.dev" : window.location.origin;
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const [midtransMode, setMidtransMode] = useState<"live" | "sandbox">(
    (settings.midtrans_mode as "live" | "sandbox") ?? "sandbox"
  );

  function handleSave(section: string, action: (fd: FormData) => Promise<{success: boolean}>, fd: FormData) {
    if (section === "midtrans") startMidtrans(async () => { await action(fd); setSavedSection("midtrans"); setTimeout(() => setSavedSection(null), 3000); });
    if (section === "gateway") startGateway(async () => { await action(fd); setSavedSection("gateway"); setTimeout(() => setSavedSection(null), 3000); });
    if (section === "email") startEmail(async () => { await action(fd); setSavedSection("email"); setTimeout(() => setSavedSection(null), 3000); });
    if (section === "google") startGoogle(async () => { await action(fd); setSavedSection("google"); setTimeout(() => setSavedSection(null), 3000); });
  }

  return (
    <div className="space-y-4">
      {/* Midtrans */}
      <Section title="Midtrans (Pembayaran)" icon={CreditCard}>
        <form action={(fd) => handleSave("midtrans", saveMidtransSettings, fd)} className="space-y-4">
          <input type="hidden" name="midtrans_mode" value={midtransMode} />

          <Field label="Merchant ID" name="midtrans_merchant_id" placeholder="M123456789" defaultValue={settings.midtrans_merchant_id} />

          {/* Live/Sandbox toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3">
            <div>
              <p className="text-sm font-bold text-foreground">Mode Aktif</p>
              <p className="text-xs text-muted-foreground">
                {midtransMode === "live" ? "Transaksi nyata (Live)" : "Mode uji coba (Sandbox)"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMidtransMode((m) => (m === "live" ? "sandbox" : "live"))}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold transition"
            >
              {midtransMode === "live" ? (
                <><ToggleRight className="h-6 w-6 text-success" /><span className="text-success">Live</span></>
              ) : (
                <><ToggleLeft className="h-6 w-6 text-warning" /><span className="text-warning">Sandbox</span></>
              )}
            </button>
          </div>

          {midtransMode === "live" ? (
            <>
              <Field label="Client Key (Live)" name="midtrans_client_key" type="password" placeholder="Mid-client-..." defaultValue={settings.midtrans_client_key} />
              <Field label="Server Key (Live)" name="midtrans_server_key" type="password" placeholder="Mid-server-..." defaultValue={settings.midtrans_server_key} />
              <Field label="Client Key (Sandbox)" name="midtrans_sandbox_client_key" type="password" placeholder="SB-Mid-client-..." defaultValue={settings.midtrans_sandbox_client_key} hint="Tetap simpan untuk fallback ke sandbox" />
              <Field label="Server Key (Sandbox)" name="midtrans_sandbox_server_key" type="password" placeholder="SB-Mid-server-..." defaultValue={settings.midtrans_sandbox_server_key} />
            </>
          ) : (
            <>
              <Field label="Client Key (Sandbox)" name="midtrans_sandbox_client_key" type="password" placeholder="SB-Mid-client-..." defaultValue={settings.midtrans_sandbox_client_key} />
              <Field label="Server Key (Sandbox)" name="midtrans_sandbox_server_key" type="password" placeholder="SB-Mid-server-..." defaultValue={settings.midtrans_sandbox_server_key} />
              <Field label="Client Key (Live)" name="midtrans_client_key" type="password" placeholder="Mid-client-..." defaultValue={settings.midtrans_client_key} hint="Isi sebelum switch ke Live" />
              <Field label="Server Key (Live)" name="midtrans_server_key" type="password" placeholder="Mid-server-..." defaultValue={settings.midtrans_server_key} />
            </>
          )}

          <p className="text-xs text-muted-foreground">
            Tidak perlu token webhook terpisah — notifikasi Midtrans diverifikasi lewat signature_key bawaan.
          </p>

          <div className="flex justify-end pt-2">
            <SaveButton pending={midtransPending} saved={savedSection === "midtrans"} />
          </div>
        </form>
      </Section>

      {/* WA Gateway */}
      <Section title="WhatsApp Gateway" icon={MessageSquare}>
        <form action={(fd) => handleSave("gateway", saveGatewaySettings, fd)} className="space-y-4">
          <Field
            label="Base URL Gateway"
            name="wa_gateway_url"
            placeholder="https://gateway.yourdomain.com"
            defaultValue={settings.wa_gateway_url}
            hint="URL server gateway WhatsApp (Node.js Baileys)"
          />
          <Field
            label="Token Autentikasi"
            name="wa_gateway_token"
            type="password"
            placeholder="Bearer token atau API key gateway"
            defaultValue={settings.wa_gateway_token}
          />
          <div className="flex justify-end pt-2">
            <SaveButton pending={gatewayPending} saved={savedSection === "gateway"} />
          </div>
        </form>
      </Section>

      {/* Email */}
      <Section title="Email Transaksional" icon={Mail}>
        <form action={(fd) => handleSave("email", saveEmailSettings, fd)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-foreground">Provider</label>
            <select
              name="email_provider"
              defaultValue={settings.email_provider ?? "resend"}
              className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            >
              <option value="resend">Resend</option>
              <option value="">Nonaktif</option>
            </select>
            <p className="mt-1 text-xs text-muted-foreground">Hanya Resend yang didukung saat ini</p>
          </div>
          <Field
            label="API Key"
            name="email_api_key"
            type="password"
            placeholder="re_..."
            defaultValue={settings.email_api_key}
            hint="Dari dashboard Resend → API Keys"
          />
          <Field
            label="Alamat Pengirim (From)"
            name="email_from"
            placeholder="noreply@yourdomain.com"
            defaultValue={settings.email_from}
            hint="Domain harus sudah diverifikasi di Resend"
          />
          <div className="flex justify-end pt-2">
            <SaveButton pending={emailPending} saved={savedSection === "email"} />
          </div>
        </form>
      </Section>

      {/* Masuk dengan Google */}
      <Section title="Masuk dengan Google" icon={LogIn}>
        <form action={(fd) => handleSave("google", saveGoogleLoginSettings, fd)} className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            Buat OAuth client (tipe <strong>Web application</strong>) di Google Cloud Console → APIs &amp; Services →
            Credentials. Isi <strong>Authorized redirect URI</strong> dengan alamat di bawah ini, persis sama termasuk
            https dan tanpa garis miring di ujung:
            <code className="mt-2 block break-all rounded-lg bg-background px-2 py-1.5 text-foreground">
              {appUrl}/api/auth/google/callback
            </code>
          </div>
          <Field
            label="Client ID"
            name="google_client_id"
            placeholder="1234567890-xxxx.apps.googleusercontent.com"
            defaultValue={settings.google_client_id}
            hint="Dari OAuth client yang baru dibuat"
          />
          <Field
            label="Client Secret"
            name="google_client_secret"
            type="password"
            placeholder="GOCSPX-..."
            defaultValue={settings.google_client_secret}
            hint="Kosongkan keduanya untuk menyembunyikan tombol Masuk dengan Google"
          />
          <div className="flex justify-end pt-2">
            <SaveButton pending={googlePending} saved={savedSection === "google"} />
          </div>
        </form>
      </Section>

      {/* Webhook info */}
      <div className="cg-card rounded-2xl p-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-foreground">
            <Globe className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-black text-foreground">URL Webhook</p>
            <p className="text-xs text-muted-foreground">Daftarkan URL ini di provider masing-masing</p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {[
            { label: "Midtrans Notification", url: "/api/webhooks/midtrans" },
            { label: "WA Gateway Events", url: "/api/webhooks/gateway" },
          ].map(({ label, url }) => (
            <div key={url} className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">{label}</span>
              <code className="rounded-lg border border-border bg-muted px-3 py-1 text-xs font-mono text-foreground">
                {`<domain>${url}`}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
