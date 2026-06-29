"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Globe,
  KeyRound,
  Mail,
  MessageSquare,
  Save,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { saveXenditSettings, saveGatewaySettings, saveEmailSettings } from "@/app/actions/admin-settings";

type Props = { settings: Record<string, string> };

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{className?: string}>; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="cg-card overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 border-b border-white/[0.08] px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-sm font-black text-white">{title}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
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
      <label className="mb-1.5 block text-xs font-bold text-slate-300">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function SaveButton({ pending, saved }: { pending: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-50"
    >
      {saved ? (
        <><CheckCircle2 className="h-4 w-4" /> Tersimpan</>
      ) : pending ? (
        <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Menyimpan…</>
      ) : (
        <><Save className="h-4 w-4" /> Simpan</>
      )}
    </button>
  );
}

export default function AdminIntegrationsClient({ settings }: Props) {
  const [xenditPending, startXendit] = useTransition();
  const [gatewayPending, startGateway] = useTransition();
  const [emailPending, startEmail] = useTransition();
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const [xenditMode, setXenditMode] = useState<"live" | "sandbox">(
    (settings.xendit_mode as "live" | "sandbox") ?? "sandbox"
  );

  function handleSave(section: string, action: (fd: FormData) => Promise<{success: boolean}>, fd: FormData) {
    if (section === "xendit") startXendit(async () => { await action(fd); setSavedSection("xendit"); setTimeout(() => setSavedSection(null), 3000); });
    if (section === "gateway") startGateway(async () => { await action(fd); setSavedSection("gateway"); setTimeout(() => setSavedSection(null), 3000); });
    if (section === "email") startEmail(async () => { await action(fd); setSavedSection("email"); setTimeout(() => setSavedSection(null), 3000); });
  }

  return (
    <div className="space-y-4">
      {/* Xendit */}
      <Section title="Xendit (Pembayaran)" icon={CreditCard}>
        <form action={(fd) => handleSave("xendit", saveXenditSettings, fd)} className="space-y-4">
          <input type="hidden" name="xendit_mode" value={xenditMode} />

          {/* Live/Sandbox toggle */}
          <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
            <div>
              <p className="text-sm font-bold text-white">Mode Aktif</p>
              <p className="text-xs text-slate-400">
                {xenditMode === "live" ? "Transaksi nyata (Live)" : "Mode uji coba (Sandbox)"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setXenditMode((m) => (m === "live" ? "sandbox" : "live"))}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition"
            >
              {xenditMode === "live" ? (
                <><ToggleRight className="h-6 w-6 text-emerald-400" /><span className="text-emerald-400">Live</span></>
              ) : (
                <><ToggleLeft className="h-6 w-6 text-amber-400" /><span className="text-amber-400">Sandbox</span></>
              )}
            </button>
          </div>

          {xenditMode === "live" ? (
            <>
              <Field label="API Key (Live)" name="xendit_api_key" type="password" placeholder="xnd_production_..." defaultValue={settings.xendit_api_key} />
              <Field label="Secret Key (Live)" name="xendit_secret_key" type="password" placeholder="xnd_production_..." defaultValue={settings.xendit_secret_key} />
              <Field label="Sandbox API Key" name="xendit_sandbox_api_key" type="password" placeholder="xnd_development_..." defaultValue={settings.xendit_sandbox_api_key} hint="Tetap simpan untuk fallback ke sandbox" />
              <Field label="Sandbox Secret Key" name="xendit_sandbox_secret_key" type="password" placeholder="xnd_development_..." defaultValue={settings.xendit_sandbox_secret_key} />
            </>
          ) : (
            <>
              <Field label="API Key (Sandbox)" name="xendit_sandbox_api_key" type="password" placeholder="xnd_development_..." defaultValue={settings.xendit_sandbox_api_key} />
              <Field label="Secret Key (Sandbox)" name="xendit_sandbox_secret_key" type="password" placeholder="xnd_development_..." defaultValue={settings.xendit_sandbox_secret_key} />
              <Field label="Live API Key" name="xendit_api_key" type="password" placeholder="xnd_production_..." defaultValue={settings.xendit_api_key} hint="Isi sebelum switch ke Live" />
              <Field label="Live Secret Key" name="xendit_secret_key" type="password" placeholder="xnd_production_..." defaultValue={settings.xendit_secret_key} />
            </>
          )}

          <Field
            label="Webhook Token"
            name="xendit_webhook_token"
            type="password"
            placeholder="Token verifikasi webhook Xendit"
            defaultValue={settings.xendit_webhook_token}
            hint="Dari dashboard Xendit → Webhooks → Callback token"
          />

          <div className="flex justify-end pt-2">
            <SaveButton pending={xenditPending} saved={savedSection === "xendit"} />
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
            <label className="mb-1.5 block text-xs font-bold text-slate-300">Provider</label>
            <select
              name="email_provider"
              defaultValue={settings.email_provider ?? "resend"}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            >
              <option value="resend">Resend</option>
              <option value="">Nonaktif</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">Hanya Resend yang didukung saat ini</p>
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

      {/* Webhook info */}
      <div className="cg-card rounded-2xl p-5">
        <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/ text-primary">
            <Globe className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-black text-white">URL Webhook</p>
            <p className="text-xs text-slate-400">Daftarkan URL ini di provider masing-masing</p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {[
            { label: "Xendit Callback", url: "/api/webhooks/xendit" },
            { label: "WA Gateway Events", url: "/api/webhooks/gateway" },
          ].map(({ label, url }) => (
            <div key={url} className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">{label}</span>
              <code className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs font-mono text-slate-300">
                {`<domain>${url}`}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
